const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  target: "node", // Compiles for usage in a Node.js environment
  mode: "production", // or 'development'
  entry: "./index.js", // Entry point of your application
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.bundle.js",
    libraryTarget: "commonjs2",
  },
  externals: [
    nodeExternals({
      // Exclude node_modules except for 'sqlite3'
      allowlist: ["sqlite3"],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".json", ".node"], // Add .node if you work with native Node modules
  },
  node: {
    // Allow the use of __dirname and __filename
    __dirname: false,
    __filename: false,
  },
};
