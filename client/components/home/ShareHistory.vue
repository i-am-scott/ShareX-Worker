<script setup lang="ts">
import type {
	ColumnDef,
	ColumnFiltersState,
} from '@tanstack/vue-table'

import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useVueTable,
} from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from '@lucide/vue'

import ShareCard from './ShareCard.vue'

import { computed, nextTick, onMounted, ref } from 'vue'
import { valueUpdater } from '@/lib/utils'
import type { Shareable } from '~/share'

import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();

const data = ref<Shareable[]>([]);

onMounted(async () => {
	data.value = await apiStore.getShares();
})

const selectedSlugs = ref<Set<string>>(new Set());
const deletingSlugs = ref<Set<string>>(new Set());

const toggleSelect = (urlSlug: string, selected: boolean) => {
	if (selected)
		selectedSlugs.value.add(urlSlug);
	else
		selectedSlugs.value.delete(urlSlug);

	selectedSlugs.value = new Set(selectedSlugs.value);
}

const deleteSelected = async () => {
	const urlSlugs = [...selectedSlugs.value];

	deletingSlugs.value = new Set(urlSlugs);

	if (await apiStore.bulkDeleteShares(urlSlugs))
	{
		data.value = data.value.filter(s => !selectedSlugs.value.has(s.urlSlug!));
		selectedSlugs.value = new Set();
		await clampPageIndex();
	}

	deletingSlugs.value = new Set();
}

const columns: ColumnDef<Shareable>[] = [
	{
		id: 'content',
		accessorKey: 'fileName',
		filterFn: (row, columnId, filterValue) => {
			return (row.original.url ?? row.original.fileName)?.toLowerCase().includes(filterValue.toLowerCase()) ?? false;
		},
	},
]

const columnFilters = ref<ColumnFiltersState>([])

const table = useVueTable({
	data,
	columns,
	getRowId: row => row.urlSlug!,
	getCoreRowModel: getCoreRowModel(),
	getPaginationRowModel: getPaginationRowModel(),
	getFilteredRowModel: getFilteredRowModel(),
	autoResetPageIndex: false,
	onColumnFiltersChange: updaterOrValue => {
		valueUpdater(updaterOrValue, columnFilters);
		table.setPageIndex(0);
	},
	state: {
		get columnFilters() { return columnFilters.value },
	},
	initialState: {
		pagination: {
			pageSize: 24
		},
	}
})

const clampPageIndex = async () => {
	await nextTick();

	const maxPageIndex = Math.max(0, table.getPageCount() - 1);

	if (table.getState().pagination.pageIndex > maxPageIndex)
		table.setPageIndex(maxPageIndex);
}

const removeShare = (urlSlug: string) => {
	data.value = data.value.filter(s => s.urlSlug !== urlSlug);

	if (selectedSlugs.value.delete(urlSlug))
		selectedSlugs.value = new Set(selectedSlugs.value);

	clampPageIndex();
}

const pageUrlSlugs = computed(() => table.getRowModel().rows.map(row => row.original.urlSlug!));

const selectAllOnPage = () => {
	const newSelection = new Set(selectedSlugs.value);

	pageUrlSlugs.value.forEach(urlSlug => newSelection.add(urlSlug));

	selectedSlugs.value = newSelection;
}

const deselectAll = () => {
	selectedSlugs.value = new Set();
}
</script>

<template>
	<div class="w-full h-full">
		<div class="flex items-center gap-2 py-4">
			<Input
				class="max-w-sm"
				placeholder="Search shares..."
				:model-value="table.getColumn('content')?.getFilterValue() as string"
				@update:model-value=" table.getColumn('content')?.setFilterValue($event)"
			/>

			<Button
				v-if="pageUrlSlugs.length > 0"
				variant="outline"
				size="sm"
				@click="selectAllOnPage"
			>
				Select All
			</Button>

			<Button
				v-if="selectedSlugs.size > 0"
				variant="outline"
				size="sm"
				@click="deselectAll"
			>
				Deselect All
			</Button>

			<Button
				v-if="selectedSlugs.size > 0"
				variant="destructive"
				size="sm"
				:disabled="deletingSlugs.size > 0"
				@click="deleteSelected"
			>
				<Trash2 class="w-4 h-4" />
				Delete Selected ({{ selectedSlugs.size }})
			</Button>
		</div>

		<div
			v-if="table.getRowModel().rows?.length"
			class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
		>
			<ShareCard
				v-for="row in table.getRowModel().rows"
				:key="row.id"
				:share="row.original"
				:selected="selectedSlugs.has(row.original.urlSlug!)"
				:deleting="deletingSlugs.has(row.original.urlSlug!)"
				@deleted="removeShare"
				@update:selected="selected => toggleSelect(row.original.urlSlug!, selected)"
			/>
		</div>

		<div v-else class="h-24 flex items-center justify-center rounded-md border text-muted-foreground">
			No results.
		</div>

		<div class="flex items-center justify-end space-x-2 py-4">
			<div class="flex-1 text-sm text-muted-foreground">
				{{ table.getFilteredRowModel().rows.length }} item(s) shown.
			</div>
			<div v-if="table.getPageCount() > 0" class="text-sm text-muted-foreground">
				Page {{ table.getState().pagination.pageIndex + 1 }} of {{ table.getPageCount() }}
			</div>
			<div class="space-x-2">
				<Button
					variant="outline"
					size="sm"
					:disabled="!table.getCanPreviousPage()"
					@click="table.previousPage()"
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					:disabled="!table.getCanNextPage()"
					@click="table.nextPage()"
				>
					Next
				</Button>
			</div>
		</div>
	</div>
</template>
