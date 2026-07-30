import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { cloudflare } from "@cloudflare/vite-plugin"

import { vite as vidstack } from 'vidstack/plugins';

import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

// https://vite.dev/config/
export default defineConfig({
	css: {
		postcss: {
			plugins: [tailwind(), autoprefixer()],
		},
	},
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('media-'),
				},
			},
		}),
		vueDevTools(),
		cloudflare(),
		vidstack()
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./client', import.meta.url)),
			'~': fileURLToPath(new URL('./shared', import.meta.url))
		},
	},
	define: {
		'APP_VERSION': JSON.stringify(process.env.npm_package_version),
	},
	build: {
		chunkSizeWarningLimit: 4500,
		commonjsOptions: {
			// @vscode/vscode-languagedetection ships a webpack bundle whose chunk
			// loader does `require("./" + chunkId + ".js")` for its tfjs backend
			// chunk. Rollup can't resolve that statically, so point it at the file
			// directly instead of leaving @rollup/plugin-commonjs throw at runtime.
			dynamicRequireTargets: [
				'node_modules/@vscode/vscode-languagedetection/dist/lib/*.js',
			],
		},
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules/monaco-editor'))
						return 'monaco';
				},
			},
		},
	},
})
