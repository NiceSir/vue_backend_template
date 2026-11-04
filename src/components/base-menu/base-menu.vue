<template>
    <div class="base-menu">
        <slot></slot>
        <el-menu default-active="2" class="el-menu-vertical">
            <el-sub-menu index="1">
                <template #title>
                    <el-icon><location /></el-icon>
                    <span>Navigator One</span>
                </template>
                <el-menu-item-group>
                    <template #title><span>Group One</span></template>
                    <el-menu-item index="1-1">item one</el-menu-item>
                    <el-menu-item index="1-2">item two</el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="Group Two">
                    <el-menu-item index="1-3">item three</el-menu-item>
                </el-menu-item-group>
                <el-sub-menu index="1-4">
                    <template #title><span>item four</span></template>
                    <el-menu-item index="1-4-1">item one</el-menu-item>
                </el-sub-menu>
            </el-sub-menu>
            <el-menu-item index="2">
                <el-icon><icon-menu /></el-icon>
                <template #title>Navigator Two</template>
            </el-menu-item>
            <el-menu-item index="3" disabled>
                <el-icon><document /></el-icon>
                <template #title>Navigator Three</template>
            </el-menu-item>
            <el-menu-item index="4">
                <el-icon><setting /></el-icon>
                <template #title>Navigator Four</template>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="less" scoped>
@import (reference) '@/less/mixins.less';
.base-menu {
    .u-flex(column,start);
    height: 100%;

    .el-menu-vertical {
        border: none;
        // 背景颜色
        --el-menu-bg-color: #001529;
        // 默认文字颜色
        --el-menu-text-color: rgba(255, 255, 255, 0.7);
        // 选中文字颜色
        --el-menu-active-color: #fff;
        // 鼠标悬停背景颜色
        --el-menu-hover-bg-color: #001529;
        // 鼠标悬停文字颜色
        --el-menu-hover-text-color: #fff;

        :deep(.el-menu-item:not(.is-disabled):hover),
        :deep(.el-sub-menu:not(.is-disabled) > .el-sub-menu__title:hover) {
            color: var(--el-menu-hover-text-color);
        }

        width: 100%;
        height: calc(100% - 64px);
    }
}
</style>
