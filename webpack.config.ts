import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import type { Configuration } from "webpack";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config: Configuration = {
    entry: {
        main: "./client/client.ts",
    },

    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, "dist/client"),
        clean: true
    },

    resolve: {
        extensions: [".ts", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "./client/index.html",
            scriptLoading: "defer",
        })
    ],

    mode: "development"
};

export default config;