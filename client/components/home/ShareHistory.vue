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

import ShareCard from './ShareCard.vue'

import { onMounted, ref } from 'vue'
import { valueUpdater } from '@/lib/utils'
import type { Shareable } from '~/share'

import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();

const data = ref<Shareable[]>([]);

onMounted(async () => {
	data.value = await apiStore.getShares();
})

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
	getCoreRowModel: getCoreRowModel(),
	getPaginationRowModel: getPaginationRowModel(),
	getFilteredRowModel: getFilteredRowModel(),
	onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
	state: {
		get columnFilters() { return columnFilters.value },
	},
	initialState: {
		pagination: {
			pageSize: 24
		},
	}
})

const removeShare = (urlSlug: string) => {
	data.value = data.value.filter(s => s.urlSlug !== urlSlug);
}
</script>

<template>
	<div class="w-full h-full">
		<div class="flex items-center py-4">
			<Input
				class="max-w-sm"
				placeholder="Search shares..."
				:model-value="table.getColumn('content')?.getFilterValue() as string"
				@update:model-value=" table.getColumn('content')?.setFilterValue($event)"
			/>
		</div>

		<div
			v-if="table.getRowModel().rows?.length"
			class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
		>
			<ShareCard
				v-for="row in table.getRowModel().rows"
				:key="row.id"
				:share="row.original"
				@deleted="removeShare"
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
