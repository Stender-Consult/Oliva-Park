/**
 * Innloggingsbro for Decap CMS mot GitHub.
 *
 * Netlify Identity + Git Gateway gjorde denne jobben automatisk. Uten
 * Netlify må vi selv stå for GitHub-innloggingen, etter samme protokoll
 * som Decap CMS (og Netlify CMS før det) forventer av en "github"-backend.
 *
 * To ruter:
 *   GET /auth       -> sender brukeren videre til GitHub for innlogging
 *   GET /callback   -> tar imot koden fra GitHub, bytter den mot et
 *                       tilgangstoken, og sender det tilbake til
 *                       admin-siden via postMessage
 *
 * Krever to hemmeligheter satt i Cloudflare (se README.md):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      return handleAuth(url, env);
    }
    if (url.pathname === "/callback") {
      return handleCallback(url, env);
    }
    return new Response("Ikke funnet", { status: 404 });
  },
};

function handleAuth(url, env) {
  const redirectUri = `${url.origin}/callback`;
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo,user");

  return Response.redirect(authorizeUrl.toString(), 302);
}

async function handleCallback(url, env) {
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Mangler kode fra GitHub.", { status: 400 });
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error || !tokenData.access_token) {
    return new Response(
      `Innlogging mot GitHub feilet: ${tokenData.error_description || tokenData.error || "ukjent feil"}`,
      { status: 400 }
    );
  }

  // Standard handshake-protokoll for Decap/Netlify CMS: popup-vinduet
  // venter pa en melding fra admin-siden, svarer med tokenet, og lukker
  // seg selv. Same-origin-sjekk via e.origin holder tokenet unna andre
  // faner som matte lytte pa postMessage.
  const payload = JSON.stringify({ token: tokenData.access_token, provider: "github" });
  const html = `<!doctype html>
<html><body>
<script>
  (function () {
    function receiveMessage(e) {
      window.opener.postMessage(
        "authorization:github:success:" + ${JSON.stringify(payload)},
        e.origin
      );
      window.removeEventListener("message", receiveMessage, false);
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script>
</body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
