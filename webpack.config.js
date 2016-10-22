module.exports = {
    entry: {
      mazes: [
        "babel-polyfill",
        "./web/index.js"
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
