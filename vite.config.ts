import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { cloudflare } from "@cloudflare/vite-plugin"

import { vite as vidstack } from 'vidstack/plugins';

import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

declare const __APP_VERSION__: string

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
	}
})
