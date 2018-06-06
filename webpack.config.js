const webpack = require('webpack');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    mode: 'none',
    devtool: 'source-map',
    entry: {
        tree: './src/index.js',
        'tree.min': './src/index.js',
    },
    output: {
        filename: '[name].js',
        libraryExport: 'default',
        library: 'Tree',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('postcss-import'),
                                require('autoprefixer'),
                            ],
                        },
                    },
                    'less-loader',
                ],
            },
        ],
    },
    plugins: [
        // new CleanWebpackPlugin(['dist']),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new UglifyJSPlugin({
            include: /\.min\.js$/,
            parallel: true,
        }),
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp: /\.min\.css$/,
        }),
        new webpack.BannerPlugin(
            'treejs\n@version 1.3.0\n@see https://github.com/daweilv/treejs'
        ),
    ],
};
