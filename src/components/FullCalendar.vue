<template>
    <div>
        <FullCalendar
            ref="fullCalendarRef"
            :options="calendarOptions"
            :events="events"
            @eventClick="handleEventClick"
            style="margin-top: 20px; border: 1px solid black;"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { db } from '../data/firebase.js'; // 确保引入 Firestore 的配置
import { collection, getDocs, query, where } from 'firebase/firestore'; // 引入 Firestore 的方法

const fullCalendarRef = ref(null);
const events = ref([]);

// FullCalendar 的选项
const calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title'
    },
};

// 处理事件点击
function handleEventClick(info) {
    alert(`Event: ${info.event.title}\nDate: ${info.event.start.toISOString()}\nLocation: ${info.event.extendedProps.location}`);
}

// 加载用户的订阅事件
async function loadEvents() {
    const user = JSON.parse(localStorage.getItem('user')); // 从 localStorage 获取用户信息
    if (!user || !user.email) {
        console.error("No user information found in localStorage.");
        return;
    }

    try {
        const eventsRef = collection(db, 'appointments'); // 创建 appointments 集合的引用
        const q = query(eventsRef, where('userEmail', '==', user.email)); // 根据用户邮箱过滤事件
        const snapshot = await getDocs(q);

        // 处理和更新事件数据
        events.value = snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().eventTitle, // 事件名称
            start: doc.data().eventStart, // 确保这个是 ISO 字符串或 Date 对象
            extendedProps: {
                location: doc.data().eventLocation, // 事件位置
            },
        })); // 获取事件数据并更新
    } catch (error) {
        console.error("Error loading events: ", error);
    }
}

// 组件挂载时加载事件
onMounted(() => {
    loadEvents(); 
});
</script>

<style scoped>
/* 适当的样式可以放在这里 */
.full-calendar {
    border: 1px solid #ccc; /* 可以添加一些样式 */
}
</style>
