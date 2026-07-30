<script setup lang="ts">
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button';
import { FolderCog } from '@lucide/vue';


import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button>
				<FolderCog class="w-4 h-4 mr-2"/> Download ShareX Configs
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent>
			<DropdownMenuGroup>
				<DropdownMenuItem @click="apiStore.downloadShareXConfig()">
					<span>Uploader Config</span>
				</DropdownMenuItem>
				<DropdownMenuItem @click="apiStore.downloadShareXConfig(false)">
					<span>Shortener Config</span>
				</DropdownMenuItem>
			</DropdownMenuGroup>
		</DropdownMenuContent>
	</DropdownMenu>
</template>