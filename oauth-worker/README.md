# Innloggingsbro for admin-panelet

Dette er en liten frittstående tjeneste (ikke en del av selve nettsiden)
som erstatter Netlify Identity. Den gjør én ting: lar Decap CMS logge deg
inn mot GitHub når du åpner `/admin/`.

Den må settes opp én gang, av deg, i Cloudflare sitt dashbord — jeg kan
ikke opprette kontoer eller hemmeligheter på dine vegne.

## Steg 1: Opprett en GitHub OAuth-app

1. Gå til **github.com/settings/developers** → **OAuth Apps** → **New OAuth App**
2. Fyll ut:
   - **Application name**: `Oliva Park CMS`
   - **Homepage URL**: `https://oliva-park.no` (eller den midlertidige Cloudflare-adressen om domenet ikke er koblet ennå)
   - **Authorization callback URL**: la stå tomt foreløpig, du fyller den inn i steg 3
3. Trykk **Register application**
4. Kopier **Client ID**
5. Trykk **Generate a new client secret**, og kopier **Client Secret** med en gang (den vises bare én gang)

## Steg 2: Deploy denne mappen som en Cloudflare Worker

1. Gå til **dash.cloudflare.com** → **Workers & Pages** → **Create** → **Workers**
2. Gi den navnet `oliva-park-cms-auth`
3. Etter den er opprettet, gå inn i den → **Edit code**
4. Slett alt som står der, og lim inn hele innholdet fra `worker.js` i denne mappen
5. Trykk **Deploy**
6. Noter adressen den får, typisk `oliva-park-cms-auth.<ditt-brukernavn>.workers.dev`

## Steg 3: Sett de to hemmelighetene

1. Inne på Worker-en → **Settings** → **Variables and Secrets**
2. Legg til to hemmeligheter (krypterte, ikke synlige i klartekst etterpå):
   - `GITHUB_CLIENT_ID` = Client ID fra steg 1
   - `GITHUB_CLIENT_SECRET` = Client Secret fra steg 1
3. Lagre

## Steg 4: Fullfør GitHub OAuth-appen

1. Gå tilbake til OAuth-appen i GitHub-innstillingene
2. Sett **Authorization callback URL** til adressen fra steg 2, med `/callback` på slutten:
   `https://oliva-park-cms-auth.<ditt-brukernavn>.workers.dev/callback`
3. Lagre

## Steg 5: Oppdater config.yml i nettside-repoet

I `src/admin/config.yml` står det en midlertidig, sannsynligvis feil,
adresse under `base_url`. Bytt den ut med den faktiske Worker-adressen
fra steg 2 (uten `/callback` på slutten), og be meg pushe endringen -
eller gjør det selv:

```yaml
backend:
  name: github
  repo: Stender-Consult/Oliva-Park
  branch: main
  base_url: https://oliva-park-cms-auth.<ditt-brukernavn>.workers.dev
  auth_endpoint: auth
```

## Steg 6: Test

Åpne `/admin/` på nettsiden. Du skal nå bli sendt til GitHub for å logge
inn (med den vanlige GitHub-kontoen din, den som har tilgang til
`Stender-Consult/Oliva-Park`), og deretter tilbake til admin-panelet.
