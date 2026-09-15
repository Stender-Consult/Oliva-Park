module.exports = {
  eleventyComputed: {
    title: (data) => data.tittel,
    description: (data) => data.beskrivelse,
    permalink: (data) => "/referanser/" + data.page.fileSlug + "/",
  },
};
