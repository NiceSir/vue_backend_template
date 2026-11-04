<template>
    <error-content error-code="500" error-message="服务器出错啦~" :src="error500Src" />
</template>

<script lang="ts" setup>
import ErrorContent from '@/components/error-content/error-content.vue';
import error500Src from '@/assets/images/error-page/error-500.svg';
</script>
