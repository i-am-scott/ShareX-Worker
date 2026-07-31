<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Shareable } from '~/share';
import { Helpers } from '~/helpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, ClipboardCopy, LoaderCircle, Trash2 } from '@lucide/vue';
import SharePreview from './SharePreview.vue';

import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();

const { share, selected = false, deleting = false } = defineProps<{
	share: Shareable,
	selected?: boolean,
	deleting?: boolean
}>()

const emit = defineEmits<{
	deleted: [urlSlug: string],
	'update:selected': [selected: boolean]
}>()

const getShareUrl = () => window.location.origin + '/' + share.urlSlug;

const copyUrl = () => navigator.clipboard.writeText(getShareUrl());

const openShare = () => window.open(getShareUrl(), '_blank')?.focus();

const isDeleting = ref(false);
const busy = computed(() => isDeleting.value || deleting);

const deleteShare = async () => {
	if (share.urlSlug == null || share.deletetionKey == null)
		return;

	isDeleting.value = true;

	if (await apiStore.deleteShare(share.urlSlug, share.deletetionKey))
		emit('deleted', share.urlSlug);
	else
		isDeleting.value = false;
}
</script>

<template>
	<Card class="relative flex flex-col items-center gap-3 p-4 cursor-pointer hover:bg-accent/50" @click="openShare">
		<div
			v-if="busy"
			class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70"
			@click.stop
		>
			<LoaderCircle class="w-6 h-6 animate-spin text-muted-foreground" />
		</div>

		<Checkbox
			class="absolute top-2 left-2 h-5 w-5"
			:model-value="selected"
			:disabled="busy"
			@click.stop
			@update:model-value="checked => emit('update:selected', checked === true)"
		>
			<Check class="h-4 w-4" />
		</Checkbox>

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
					<Button variant="ghost" class="w-8 h-8 p-0" :disabled="busy" @click="copyUrl">
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
						<Button variant="ghost" class="w-8 h-8 p-0 text-destructive hover:text-destructive" :disabled="busy" @click="deleteShare">
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
