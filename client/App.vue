<script setup lang="ts">
import AppSidebar from '@/components/NavSidebar.vue'
import UpdateAlert from '@/components/UpdateAlert.vue';
import LoadingSpinny from '@/components/LoadingSpinny.vue';
import OptionsSidebar from '@/components/OptionsSidebar.vue'

import { SidebarProvider } from '@/components/ui/sidebar';

import { useApiStore } from '@/stores/api';
import { onMounted, } from 'vue';

const apiStore = useApiStore();

onMounted(async () => {
	await apiStore.checkForUpdates();
})
</script>

<template>
	<SidebarProvider :defaultOpen="apiStore.isAuthed">
		<AppSidebar/>

		<main>
			<UpdateAlert v-if="apiStore.updateAvailable"/>

			<!--<SidebarTrigger v-show="sidebarNotOpen" />-->

			<LoadingSpinny v-show="!apiStore.isPageLoaded"/>
			<RouterView v-show="apiStore.isPageLoaded"/>
		</main>

		<!-- Put this here instead of the share component so we can use the same sidebar provider, is there a better way? probably -->
		<OptionsSidebar v-show="apiStore.isOptionsActive"/>
	</SidebarProvider>
</template>

<style>
main {
	width: 100%;
}
</style>