<template>
    <base-page>
        <template #left>
            <base-menu :isCollapsed="isCollapsedMenu">
                <div class="menu-title" :style="{ 'background-color': getPageTitle().bgColor }">
                    {{ getPageTitle().name }}
                </div>
            </base-menu>
        </template>
        <template #header>
            <base-header v-model:isCollapsed="isCollapsedMenu" />
        </template>
    </base-page>
</template>

<script lang="ts" setup>
import basePage from '@/components/base-page/base-page.vue';
import baseMenu from '@/components/base-menu/base-menu.vue';
import baseHeader from '@/components/base-header/base-header.vue';
import { ref } from 'vue';

const getPageTitle = () => {
    const isDev = !window.location.host.includes('admin.kachi.chat');
    const name = isDev ? 'kachi运营后台（测试）' : 'kachi运营后台';
    const bgColor = isDev ? '#9e2a22' : '#001529';
    return { name, bgColor, test: isDev };
};

const isCollapsedMenu = ref(false);
</script>

<style lang="less" scoped>
@import (reference) '@/less/mixins.less';

.menu-title {
    width: 100%;
    height: 64px;
    .u-flex();
    font-size: 20px;
    color: #fff;
}
</style>
