<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from '@lucide/vue'
import type { Shareable } from '~/share';

defineProps<{
	share: Shareable
}>()

const getShareUrl = (shareable: Shareable) => {
	return (window.location.origin + '/' + shareable.urlSlug)
}

const copyUrl = (shareable: Shareable) => {
	navigator.clipboard.writeText(getShareUrl(shareable))
}

const openShare = (shareable: Shareable) => {
	window.open(getShareUrl(shareable), '_blank')?.focus();
}
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="ghost" class="w-8 h-8 p-0">
				<span class="sr-only">Open menu</span>
				<MoreHorizontal class="w-4 h-4" />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuItem @click="copyUrl(share)">
				Copy Share URL
			</DropdownMenuItem>
			<DropdownMenuItem @click="openShare(share)">
				Open Share URL
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>