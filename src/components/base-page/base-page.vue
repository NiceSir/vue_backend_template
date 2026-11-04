<template>
    <el-container class="base-page">
        <el-aside class="base-page-left"><slot name="left"></slot></el-aside>
        <el-container class="base-page-right">
            <el-header class="base-page-header">
                <slot name="header"></slot>
            </el-header>
            <el-main class="base-page-main">Main</el-main>
        </el-container>
    </el-container>
</template>

<script lang="ts" setup></script>

<style lang="less" scoped>
@import (reference) '@/less/mixins.less';

.base-page {
    width: 100%;
    height: 100%;

    .base-page-left {
        width: 256px;
        height: 100%;
    }

    .base-page-right {
        min-width: 900px;
    }

    .base-page-header {
        height: 64px;
        padding: 0;
    }
}
</style>
