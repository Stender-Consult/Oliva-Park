module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });

  eleventyConfig.addCollection("prosjekter", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/prosjekter/*.md").sort((a, b) => {
      var da = a.data.dato ? new Date(a.data.dato).getTime() : 0;
      var db = b.data.dato ? new Date(b.data.dato).getTime() : 0;
      return db - da;
    });
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
