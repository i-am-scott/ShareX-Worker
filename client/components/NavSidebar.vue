<script setup lang="ts">
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarFooter
} from '@/components/ui/sidebar'

import { LogOut } from '@lucide/vue';

import router from '@/router';
import { computed, } from 'vue'
import { useRoute } from 'vue-router';

import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();

const route = useRoute();
const path = computed(() => route.path)
</script>

<template>
	<Sidebar collapsible="offcanvas" variant="floating">
		<!--<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg" as-child class="md:h-8 md:p-0">
						<a href="#">
							<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<Command class="size-4" />
							</div>

							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>-->

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent class="px-1.5 md:px-0">
						<SidebarMenu>
							<template v-for="item in router.options.routes" :key="item.name">
								<SidebarMenuItem
								v-show="item.meta?.icon &&
								(
									((!item.meta.requiresAuth && !apiStore.isAuthed) || (item.meta.requiresAuth && apiStore.isAuthed))
								)">
									<SidebarMenuButton
										:tooltip="String(item.name)"
										:is-active="path == item.path"
										class="px-2.5 md:px-2"
										@click="() => router.push(item.path)"
									>
									<component :is="item.meta?.icon" />
								</SidebarMenuButton>
							</SidebarMenuItem>
						</template>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter v-show="apiStore.isAuthed">
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton tooltip="Logout" class="px-2.5 md:px-2" @click="apiStore.unAuth()">
						<LogOut/>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
	</Sidebar>
</template>