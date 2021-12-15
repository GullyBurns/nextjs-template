require('dotenv').config()

const webpack = require("webpack");
const path = require("path");

module.exports = {
  webpack(config, options) {
    config.resolve.modules.push(path.resolve("./"));
    config.module.rules.push({
       test: /\.tsv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        }
    });
    return config;
  }
}
