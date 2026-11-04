<template>
    <error-content error-code="401" error-message="Oh~~您没有浏览这个页面的权限~" :src="error401Src" />
</template>

<script lang="ts" setup>
import ErrorContent from '@/components/error-content/error-content.vue';
import error401Src from '@/assets/images/error-page/error-401.svg';
</script>
