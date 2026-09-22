module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ images: 'images' });
  eleventyConfig.addPassthroughCopy({ content: 'content' });
  eleventyConfig.addPassthroughCopy('*.css');
  eleventyConfig.addPassthroughCopy('*.js');
  eleventyConfig.addPassthroughCopy('*.png');
  eleventyConfig.addPassthroughCopy('*.jpg');
  eleventyConfig.addPassthroughCopy('*.jpeg');
  eleventyConfig.addPassthroughCopy('*.json');

  eleventyConfig.addGlobalData('eleventyComputed', {
    permalink: function (data) {
      var inputPath = data.page.inputPath.replace(/^\.\//, '').replace(/\.html$/, '');
      return inputPath.split('/').pop() + '.html';
    }
  });

  return {
    dir: {
      input: '.',
      includes: '_includes',
      output: '_site'
    },
    htmlTemplateEngine: 'liquid',
    templateFormats: ['html']
  };
};
