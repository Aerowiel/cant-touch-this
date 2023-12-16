/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  serverModuleFormat: "esm",
  browserNodeBuiltinsPolyfill: {
    modules: { string_decoder: true, events: true, buffer: true },
  },
};
