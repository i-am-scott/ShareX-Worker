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
} from '@/components/ui/sidebar';

import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogContent,
	DialogTitle,
	DialogTrigger,
	DialogClose
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

import {
	ClipboardCopy,
	FilePlus2,
	Link,
	Trash2
} from '@lucide/vue';

import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();

import router from '@/router';
import { Http } from '@/utils/http';

const copyUrl = async () => await navigator.clipboard.writeText(document.URL
);
const openFileUrl = () => window.open(apiStore.activeShare?.fileUrl, '_blank')?.focus();
const openShortUrl = () => window.open(apiStore.activeShare?.url, '_blank')?.focus();
const deleteShare = async () => await Http.post('delete/' + apiStore.activeShare?.urlSlug);
const diagUpdate = (open: boolean) => {
	if (!open)
		router.push('/');
}
</script>

<template>
	<Sidebar collapsible="offcanvas" variant="floating" side="right" v-show="apiStore.activeShare">
		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupContent class="px-1.5 md:px-0">
					<SidebarMenu>
						<SidebarMenuItem v-show="!apiStore.activeShare?.isUrl()">
							<SidebarMenuButton tooltip="Copy URL" class="px-2.5 md:px-2" @click="copyUrl">
								<ClipboardCopy />
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem v-show="!apiStore.activeShare?.isUrl()">
							<SidebarMenuButton tooltip="Open File" class="px-2.5 md:px-2" @click="openFileUrl">
								<FilePlus2 />
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem v-show="apiStore.activeShare?.isUrl()">
							<SidebarMenuButton tooltip="Open URL" class="px-2.5 md:px-2" @click="openShortUrl">
								<Link />
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
		<SidebarFooter v-show="apiStore.isAuthed">
			<SidebarMenu>
				<SidebarMenuItem>
					<Dialog @update:open="diagUpdate">
						<DialogTrigger as-child>
							<SidebarMenuButton tooltip="Delete Share" class="px-2.5 md:px-2" @click="deleteShare">
								<Trash2/>
							</SidebarMenuButton>
						</DialogTrigger>

						<DialogContent class="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Share Deleted</DialogTitle>
								<DialogDescription>
								'{{ apiStore.activeShare?.url ?? apiStore.activeShare?.fileName }}' has been deleted!
								</DialogDescription>
							</DialogHeader>

							<DialogFooter>
								<DialogClose as-child>
									<Button class="w-full" @click="diagUpdate(false)">
									Close
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent >
					</Dialog>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
	</Sidebar>
</template>