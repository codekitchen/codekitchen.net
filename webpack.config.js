module.exports = {
    entry: [
      "babel-polyfill",
      "./web/index.js"
    ],
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
