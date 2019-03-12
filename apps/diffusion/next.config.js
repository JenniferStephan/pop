const withCSS = require("@zeit/next-css");
const SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin");

module.exports = withCSS({
  webpack: config => {
    // Unshift polyfills in main entrypoint.
    // Source: https://github.com/zeit/next.js/issues/2060#issuecomment-385199026
    const originalEntry = config.entry;
    config.entry = async () => {
      const entries = await originalEntry();
      if (entries["main.js"]) {
        entries["main.js"].unshift("./src/polyfill.js");
      }
      return entries;
    };
    // Source: https://github.com/zeit/next.js/tree/85769c3d3296cdcddc0fb36f05058c8e451ca57f/examples/with-sw-precache
    config.plugins.push(
      new SWPrecacheWebpackPlugin({
        verbose: true,
        staticFileGlobsIgnorePatterns: [/\.next\//],
        runtimeCaching: [
          {
            handler: "networkFirst",
            urlPattern: /^https?.*/
          }
        ]
      })
    );

    return config;
  }
});
