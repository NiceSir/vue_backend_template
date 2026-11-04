import { useCountdown } from '@vueuse/core';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
/**
 * 返回倒计时 hook
 * @param total 总时间，默认5秒
 * @returns {
 *  remaining: 当前时间
 *  start: 开始倒计时
 *  pause: 暂停倒计时
 * }
 */
export const useBackCountDown = (total: number = 5) => {
    const router = useRouter();
    const { remaining, start, pause } = useCountdown(total, {
        onComplete: () => {
            router.go(-1);
        },
    });

    onMounted(() => {
        start();
    });


    return {
        remaining,
        start,
        pause,
    };
};
