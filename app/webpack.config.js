const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const path = require('path')

const mode = process.env.NODE_ENV || 'development'
const isDev = mode === 'development'

const baseConfig = {
  mode,
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: ['.tsx', '.ts', '.js'],
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'esnext',
        },
      },
      {
        test: /\.(sa|s?c)ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.(eot|woff2?|ttf|svg|png|jpe?g|gifv?|webp)$/i,
        type: 'asset', // replaces {file,raw,url}-loader in webpack 5.
        generator: {
          filename: 'static/[hash][ext][query]',
        },
      },
    ],
  },
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015',
        css: true,
      }),
    ],
    usedExports: true,
    splitChunks: {
      minSize: 0,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, 'static/index.html'),
      hash: true,
      minify: isDev
        ? false
        : {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    new CspHtmlWebpackPlugin(
      {
        'script-src': [isDev ? "'unsafe-eval'" : "'self'"],
        'style-src': ["'self'"],
      },
      {
        hashingMethod: 'sha512',
        hashEnabled: {
          'style-src': isDev,
        },
      }
    ),
    new MiniCssExtractPlugin(),
  ],
}

module.exports = baseConfig
