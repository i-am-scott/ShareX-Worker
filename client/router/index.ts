import { createRouter, createWebHistory } from 'vue-router';

import { useApiStore } from '@/stores/api';



// https://lucide.dev/icons/
import { House, UploadCloud, Link, KeyRound } from '@lucide/vue';


// Metadata
/*
	requiresAuth: bool - redirect to auth & hide from nav if not authed
	icon: Component - icon to show in nav
	showOptionsBar: bool, - show the options bar, which currently only works for the share view
*/

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Home',
			component: () => import('@/views/Home.vue'),
			meta: {
				requiresAuth: true,
				icon: House,
			}
		},
		{
			path: '/upload',
			name: 'Upload File',
			component: () => import('@/views/Upload.vue'),
			meta: {
				requiresAuth: true,
				icon: UploadCloud,
			}
		},
		{
			path: '/shorten',
			name: 'Shorten URL',
			component: () => import('@/views/Shorten.vue'),
			meta: {
				requiresAuth: true,
				icon: Link,
			}
		},
		{
			path: '/login',
			name: 'Login',
			component: () => import('@/views/Login.vue'),
			meta: {
				icon: KeyRound
			},
			beforeEnter: (to, from, next) => {
				const apiStore = useApiStore();
				if (apiStore.isAuthed)
					return next('/')

				next();
			}
		},
		{
			// this regex needs to be updated in server/index.ts if changed
			path: '/:urlSlug(\[a-zA-Z0-9]{1,}):fileExtetion?:(\\.?[a-zA-Z0-9\.]*?)',
			name: 'Share',
			component: () => import('@/views/Share.vue'),
			meta: {
				showOptionsBar: true,
				pageTitle: false
			}
		},
		{
			name: '404',
			path: '/:catchAll(.*)*',
			component: () => import('@/views/NotFound.vue'),
		}
	],
})


router.beforeEach((to, from, next) => {
	const apiStore = useApiStore();

	apiStore.isOptionsActive = to.meta.showOptionsBar === true;

	if (to.matched.some(record => record.meta.requiresAuth))
		if (!apiStore.isAuthed)
			next({ name: 'Login' })
		else
			next()
	else
		next()
});

const pageTitle = 'ShareX-Worker';
router.afterEach((to, from) => {
	if (to.meta.pageTitle !== false)
		document.title = pageTitle + (to.name ? (' - ' + String(to.name)): '');
});

export default router