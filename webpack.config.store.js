const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { NetworkOnly } from "workbox-strategies";
import { NetworkFirst } from "workbox-strategies";

registerRoute(
	new RegExp("/(images|assets|admin-assets)/"),
	new StaleWhileRevalidate()
);

registerRoute(new RegExp("/api/"), new NetworkOnly()),
	registerRoute(new RegExp("/ajax/payment_form_settings"), new NetworkOnly()),
	registerRoute(new RegExp("/"), new NetworkFirst()),
	(module.exports = {
		entry: {
			app: ["@babel/polyfill", "./src/client/index.js"],
			theme: ["theme"],
		},

		performance: {
			hints: false,
		},

		output: {
			publicPath: "/",
			path: path.resolve(__dirname, "theme"),
			filename: "assets/js/[name]-[chunkhash].js",
			chunkFilename: "assets/js/[name]-[chunkhash].js",
		},

		optimization: {
			splitChunks: {
				cacheGroups: {
					vendor: {
						chunks: "initial",
						name: "theme",
						test: "theme",
						enforce: true,
					},
				},
			},
		},

		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: ["@babel/env", "@babel/react"],
							plugins: ["transform-class-properties"],
						},
					},
				},
				{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: "css-loader",
							options: {
								modules: false,
								importLoaders: true,
							},
						},
						"postcss-loader",
					],
				},
				{
					test: /\.s(c|a)ss$/,
					use: [
						MiniCssExtractPlugin.loader,
						"css-loader",
						"postcss-loader",
						"sass-loader",
					],
				},
			],
		},

		plugins: [
			new CleanWebpackPlugin(),
			new MiniCssExtractPlugin({
				filename: "assets/css/bundle-[contenthash].css",
				chunkFilename: "assets/css/bundle-[contenthash].css",
			}),
			new HtmlWebpackPlugin({
				template: "theme/index.html",
				inject: "body",
				filename: "assets/index.html",
			}),
			new WorkboxPlugin.GenerateSW({
				swDest: "assets/sw.js",
				precacheManifestFilename: "assets/precache-manifest.[manifestHash].js",
				clientsClaim: true,
				skipWaiting: true,
				exclude: [/\.html$/],
			}),
			new webpack.BannerPlugin({
				banner: `Created: ${new Date().toUTCString()}`,
				raw: false,
				entryOnly: false,
			}),
		],

		stats: {
			children: false,
			entrypoints: false,
			modules: false,
		},
	});
