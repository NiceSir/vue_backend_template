<template>
    <main class="error-content">
        <img class="error-content-img" :src="props.src" alt="error-content" />
        <div class="error-content-text">
            <h1>{{ props.errorCode }}</h1>
            <h2>{{ props.errorMessage }}</h2>
        </div>
        <back-count-down />
    </main>
</template>

<script lang="ts" setup>
import backCountDown from '../back-count-down/back-count-down.vue';
const props = defineProps<{
    errorCode: string;
    errorMessage: string;
    src: string;
}>();
</script>

<style lang="less" scoped>
@import (reference) '@/less/mixins.less';

.error-content {
    width: 100%;
    height: 100%;
    .u-flex();
    position: relative;
    .error-content-img {
        width: 80%;
        height: 80%;
    }
    .error-content-text {
        .u-absolute(15%);
        h1 {
            color: #348eed;
        }
        h2 {
            color: #67647d;
        }
    }
}
</style>
