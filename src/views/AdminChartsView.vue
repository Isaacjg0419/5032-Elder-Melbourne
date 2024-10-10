<template>
    <el-container>
        <AdminNavBar />
        <el-header style="margin-top: 20px;">
            <h1>Admin Charts</h1>
        </el-header>
        <el-main>
            <div>
                <h2>Appointments Overview</h2>
                <BarChart :chart-data="chartData" :chart-options="chartOptions" />
                <div v-if="noAppointments">No appointments available.</div>
            </div>
        </el-main>
    </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../data/firebase';
import { collection, getDocs } from 'firebase/firestore';
import AdminNavBar from '@/components/AdminNavBar.vue';
import BarChart from '@/components/BarChart.vue';

const chartData = ref({
    labels: [],
    datasets: [{
        label: 'Number of Appointments',
        backgroundColor: '#42A5F5',
        data: []
    }]
});
const chartOptions = ref({
    responsive: true,
    plugins: {
        legend: {
            position: 'top'
        },
        title: {
            display: true,
            text: 'Appointments by Title'
        }
    }
});
const noAppointments = ref(false);

onMounted(async () => {
    const appointments = await fetchAppointments();
    console.log('Fetched appointments:', appointments);
    prepareChartData(appointments);
    console.log('Chart Data:', chartData.value);
});

const fetchAppointments = async () => {
    const appointmentsCollection = collection(db, 'appointments');
    const snapshot = await getDocs(appointmentsCollection);

    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Fetched appointments:', appointments);

    return appointments;
};

const prepareChartData = (appointments) => {
    if (!appointments || appointments.length === 0) {
        console.warn('No appointments found.');
        noAppointments.value = true;
        chartData.value.labels = [];
        chartData.value.datasets[0].data = [];
        return;
    }

    const eventCounts = {};
    appointments.forEach(appointment => {
        const title = appointment.eventTitle;
        eventCounts[title] = (eventCounts[title] || 0) + 1;
    });

    chartData.value.labels = Object.keys(eventCounts);
    chartData.value.datasets[0].data = Object.values(eventCounts);
};
</script>

<style scoped></style>
