<template>
    <div class="back-count-down">
        <el-button size="large" type="text" @click="backHome">返回首页</el-button>
        <el-button size="large" type="text" @click="backPrev"
            >返回上一页({{ remaining }}s)</el-button
        >
    </div>
</template>

<script lang="ts" setup>
import { useBackCountDown } from '@/hooks/use-back-count-down';
import router from '@/router';
import { HOME_PAGE_NAME } from '@/router/routers';

const { remaining } = useBackCountDown();

const backHome = () => {
    router.replace({ name: HOME_PAGE_NAME });
};

const backPrev = () => {
    router.go(-1);
};
</script>

<style lang="less" scoped>
@import (reference) '@/less/mixins.less';
</style>
