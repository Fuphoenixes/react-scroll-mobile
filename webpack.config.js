const path = require('path');
const nodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
	    {
		    test: /\.(png|jpg|gif)$/,
		    use: 'url-loader?limit=819200'
	    },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        use: [
        	'style-loader',
	        {
		        loader: 'css-loader',
		        options: {
			        modules: true,
			        localIdentName: '[hash:base64:6]'
		        }
	        },
	        'less-loader'
        ]
      }
    ]
  },
	plugins:[
		new UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
  ],
  externals: [nodeExternals()]
};
