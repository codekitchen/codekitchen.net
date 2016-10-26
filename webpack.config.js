module.exports = {
  devtool: 'source-map',
    entry: {
      mazes: [
        "babel-polyfill",
        "./web/mazes.js"
      ],
      gallery: [
        "babel-polyfill",
        "./web/gallery.js"
      ]
    },
    output: {
        path: __dirname + "/public",
        filename: "[name]/index.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.js$/, loader: "babel-loader" }
        ]
    }
};
