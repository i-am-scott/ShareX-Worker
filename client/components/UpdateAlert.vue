<script setup lang="ts">
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useApiStore } from '@/stores/api';

const apiStore = useApiStore();

const currentVersion = APP_VERSION;

//
</script>

<template>
	<AlertDialog :defaultOpen="true">
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>
					Update Available!
				</AlertDialogTitle>
				<AlertDialogDescription>
					ShareX-Worker version {{ apiStore.updateVersion }} is available. You're currently running version {{ currentVersion }}.
					<br>
					<br>
					Sync your repository fork to update.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel>Dismiss</AlertDialogCancel>
				<AlertDialogAction>
					<a href="https://github.com/aStonePenguin/ShareX-Worker" target="_blank">
						Open GitHub
					</a>
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</template>