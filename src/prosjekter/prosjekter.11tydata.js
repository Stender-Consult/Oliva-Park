module.exports = {
  eleventyComputed: {
    title: (data) => data.tittel,
    description: (data) => data.beskrivelse,
  },
};
