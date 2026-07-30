<script setup lang="ts">
import { Share } from '~/share';
import FileIcon from '@/components/FileIcon.vue';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import CenteredPage from '@/components/CenteredPage.vue'
import { Download } from '@lucide/vue';

import { Helpers } from '~/helpers';
import { useApiStore } from '@/stores/api';
const apiStore = useApiStore();

defineProps({
	share: Share,
})

apiStore.isPageLoaded = true;
</script>

<template>
	<CenteredPage>
		<FileIcon :share="share"/>

		<div class="w-full max-w-sm">
			<Card class="w-full max-w-sm">

				<CardHeader class="text-center">
					<CardTitle class="text-2xl">{{ share?.fileName }}</CardTitle>
					<CardDescription>MD5: {{ share?.contentMd5 }}</CardDescription>
				</CardHeader>

				<CardFooter>
					<a :href="share?.fileUrl" class="w-full" download>
						<Button class="w-full">
							<Download class="w-4 h-4 mr-2"/> Download ({{ Helpers.bytesToString(share?.contentSize!) }})
						</Button>
					</a>
				</CardFooter>

			</Card>
		</div>
	</CenteredPage>
</template>
