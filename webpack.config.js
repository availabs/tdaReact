var path = require('path');
var webpack = require('webpack');

var webpackConfig;

if (process.env.NODE_ENV === 'development') {

    webpackConfig = {
        devtool: 'eval',
        entry: [
          'webpack-dev-server/client?http://localhost:11233',
          'webpack/hot/only-dev-server',
          './assets/react/indexView.jsx',
        ],
        output: {
          path: path.join(__dirname, '.tmp/public'),
          filename: 'bundle.js',
          publicPath: 'http://localhost:11233/',
        },
        plugins: [
          new webpack.NoErrorsPlugin(),
          new webpack.HotModuleReplacementPlugin(),
          new webpack.optimize.OccurenceOrderPlugin(),
        ],
        resolve: {
          extensions: ['', '.js', '.jsx']
        },
        watch:true,
        module: {
          loaders: [{
            test: /\.jsx?$|react\.js/,
            loaders: ['react-hot', 'babel'],
            include: path.join(__dirname, 'assets'),
            exclude: /sails\.io\.js$|nvd3\.js|node_modules$|\w+\.topo\.js/
          }]
        }
    };

} else {

    webpackConfig = {

        entry: './assets/react/indexView.jsx',
        
        output: {
          path: path.join(__dirname, '.tmp/public'),
          filename: 'bundle.js',
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                  warnings: false,
                  sequences: true,
                  dead_code: true,
                  conditionals: true,
                  booleans: true,
                  unused: true,
                  if_return: true,
                  join_vars: true,
                  drop_console: true,
                  screw_ie8: true,
                },
            }),
            new webpack.optimize.DedupePlugin(),
        ],
        resolve: {
          extensions: ['', '.js', '.jsx']
        },
        module: {
          loaders: [{
            test: /\.jsx?$|react\.js/,
            loaders: ['babel'],
            include: path.join(__dirname, 'assets')
          }]
        }
    };
}


module.exports = webpackConfig;
