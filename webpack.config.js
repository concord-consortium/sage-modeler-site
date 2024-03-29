'use strict';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const packageJSON = require("./package.json");

const now = new Date(),
      buildDate = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';

  const environment = process.env.ENVIRONMENT || "development",
        buildInfo = {
          date: buildDate,
          tag: packageJSON.version
        },
        buildInfoString = `${buildInfo.date} ${buildInfo.tag}`,
        cfmUrl = devMode ? "/cfm" : "/cfm",
        codapUrl = devMode ? "/codap/static/dg/en/cert/index.html" : "/releases/stable/static/dg/en/cert/index.html",
        sageUrl = devMode ? "/sage" : "/sage";

  return [
    // main application
    {
      context: __dirname, // to automatically find tsconfig.json
      devtool: 'source-map',
      entry: './src/code/index.tsx',
      mode: 'development',
      devServer: {
        disableHostCheck: true,
      },
      output: {
        path: __dirname + (devMode ? "/dev" : "/dist"),
        filename: 'app/js/app.js'
      },
      performance: { hints: false },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            enforce: 'pre',
            use: [
              {
                loader: 'tslint-loader',
                options: {
                  configFile: 'tslint.json',
                  failOnHint: true
                }
              }
            ]
          },
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true // IMPORTANT! use transpileOnly mode to speed-up compilation
            }
          },
          {
            test: /\.(sa|sc|c)ss$/i,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader',
              'sass-loader'
            ]
          },
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'fonts/[name].[ext]',
              publicPath: function(url) {
                // cf. https://github.com/webpack-contrib/file-loader/issues/160#issuecomment-349771544
                return url.replace(/fonts/, '../fonts');
              }
            }
          },
          {
            test: /\.(png|cur|svg)$/,
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'img/[name].[ext]',
              publicPath: function(url) {
                // cf. https://github.com/webpack-contrib/file-loader/issues/160#issuecomment-349771544
                return url.replace(/img/, '../img');
              }
            }
          },
        ]
      },
      resolve: {
        extensions: [ '.ts', '.tsx', '.js' ]
      },
      stats: {
        // suppress "export not found" warnings about re-exported types
        warningsFilter: /export .* was not found in/
      },
      plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new MiniCssExtractPlugin({
          filename: "app/css/app.css"
        }),
        new HtmlWebpackPlugin({
          inject: false,
          filename: 'app/index.html',
          template: 'src/templates/index.html.ejs',
          __BUILD_INFO__: buildInfoString,
          __ENVIRONMENT__: environment,
          __VERSION__: buildInfo.tag,
          __BUILD_DATE__: buildInfo.date,
          __CFM_URL__: cfmUrl,
          __CODAP_URL__: codapUrl,
          __SAGE_URL__: sageUrl
        }),
        new CopyWebpackPlugin([{
          from: 'src/assets',
          to: ''
        }]),
        // splashscreen.js in building-models uses app relative `img/logo.png` url
        new CopyWebpackPlugin([{
          from: 'src/assets/img',
          to: 'app/img'
        }]),
        new CopyWebpackPlugin([{
          from: 'src/microsite',
          to: ''
        }])
      ],
      optimization: {
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              filename: 'app/js/globals.js'
            }
          }
        }
      }
    },

    // report item interactive
    {
      context: __dirname, // to automatically find tsconfig.json
      devtool: 'source-map',
      entry: './src/code/report-item/index.tsx',
      mode: 'development',
      output: {
        path: __dirname + (devMode ? "/dev" : "/dist"),
        filename: 'report-item/report-item.js'
      },
      performance: { hints: false },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            enforce: 'pre',
            use: [
              {
                loader: 'tslint-loader',
                options: {
                  configFile: 'tslint.json',
                  failOnHint: true
                }
              }
            ]
          },
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true // IMPORTANT! use transpileOnly mode to speed-up compilation
            }
          },
          {
            test: /\.(sa|sc|c)ss$/i,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader',
              'sass-loader'
            ]
          },
        ]
      },
      resolve: {
        extensions: [ '.ts', '.tsx', '.js']
      },
      stats: {
        // suppress "export not found" warnings about re-exported types
        warningsFilter: /export .* was not found in/
      },
      plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new MiniCssExtractPlugin({
          filename: "report-item/report-item.css"
        }),
        new HtmlWebpackPlugin({
          filename: 'report-item/index.html',
          template: 'src/templates/report-item.html'
        }),
      ],
    }
  ]
};
