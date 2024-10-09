<template>
    <div>
        <FullCalendar :options="calendarOptions" :events="events" @eventClick="handleEventClick"
            style="margin-top: 20px; border: 1px solid black;" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const events = ref([]); // 接收父组件传来的事件数据

const calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
};

// 处理日历事件点击
function handleEventClick(info) {
    alert(`Event: ${info.event.title}\nDate: ${info.event.start}\nLocation: ${info.event.extendedProps.location}`);
}
</script>

<style scoped>
/* 适当的样式可以放在这里 */
</style>
