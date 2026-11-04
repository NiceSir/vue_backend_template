<template>
  <error-content error-code="404" error-message="Oh~~您的页面好像飞走了~" :src="error404Src" />
</template>

<script lang="ts" setup>
import ErrorContent from '@/components/error-content/error-content.vue';
import error404Src from '@/assets/images/error-page/error-404.svg';
</script>
