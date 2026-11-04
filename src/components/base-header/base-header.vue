<template>
    <div class="base-header">
        <el-button :icon="Eleme" class="base-header-collapsed" @click="isCollapsed=!isCollapsed"></el-button>
    </div>
</template>

<script lang="ts" setup>
import { Eleme } from '@element-plus/icons-vue';

const isCollapsed = defineModel('isCollapsed', { type: Boolean, default: false });

</script>

<style lang="less" scoped>
@import (reference) '@/less/mixins.less';
.base-header {
    width: 100%;
    height: 100%;
    background-color: #fff;
    padding: 0 20px;
    .u-flex(row,start);

    .base-header-collapsed {
        border: none;
        --el-button-hover-bg-color: transparent;
        height: 40px;
        width: 40px;
        font-size: 26px;
    }
}
</style>
