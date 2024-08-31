import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
	plugins: [svgr(), react()],
	css: {
		postcss: './postcss.config.js',
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
