<script setup lang="ts">
import type { Shareable } from '~/share';
import { Helpers } from '~/helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ClipboardCopy, Trash2 } from '@lucide/vue';
import SharePreview from './SharePreview.vue';

import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();

const { share } = defineProps<{
	share: Shareable
}>()

const emit = defineEmits<{
	deleted: [urlSlug: string]
}>()

const getShareUrl = () => window.location.origin + '/' + share.urlSlug;

const copyUrl = () => navigator.clipboard.writeText(getShareUrl());

const openShare = () => window.open(getShareUrl(), '_blank')?.focus();

const deleteShare = async () => {
	if (share.urlSlug == null || share.deletetionKey == null)
		return;

	if (await apiStore.deleteShare(share.urlSlug, share.deletetionKey))
		emit('deleted', share.urlSlug);
}
</script>

<template>
	<Card class="flex flex-col items-center gap-3 p-4 cursor-pointer hover:bg-accent/50" @click="openShare">
		<SharePreview :share="share" size="w-20 h-20" />

		<div class="w-full text-center">
			<div class="truncate text-sm font-medium" :title="share.url ?? share.fileName">
				{{ share.url ?? share.fileName }}
			</div>
			<div class="text-xs text-muted-foreground">
				{{ new Date(share.creationDate!).toLocaleDateString() }}
				<template v-if="share.contentSize != null"> &middot; {{ Helpers.bytesToString(share.contentSize) }}</template>
			</div>
		</div>

		<Separator />

		<div class="flex items-center gap-1" @click.stop>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="ghost" class="w-8 h-8 p-0" @click="copyUrl">
						<span class="sr-only">Copy Share URL</span>
						<ClipboardCopy class="w-4 h-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Copy Share URL</TooltipContent>
			</Tooltip>

			<template v-if="share.deletetionKey != null">
				<Separator orientation="vertical" class="h-5" />

				<Tooltip>
					<TooltipTrigger as-child>
						<Button variant="ghost" class="w-8 h-8 p-0 text-destructive hover:text-destructive" @click="deleteShare">
							<span class="sr-only">Delete Share</span>
							<Trash2 class="w-4 h-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Delete Share</TooltipContent>
				</Tooltip>
			</template>
		</div>
	</Card>
</template>
