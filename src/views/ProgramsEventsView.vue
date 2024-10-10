<template>
    <div>
        <Navbar />

        <!-- Introduction Section -->
        <section class="introduction-section">
            <div class="row">
                <div class="col-12 col-lg-6">
                    <h1>Program and Events</h1>
                    <p class="introduction-text">
                        We offer a range of activities for older people, both in person and online.
                    </p>
                </div>
                <div class="col-12 col-lg-6">
                    <img :src="eventsImage" alt="An image showing events information available for older adults"
                        class="responsive-image" />
                </div>
            </div>
        </section>

        <!-- Events Section -->
        <section class="events-section">
            <h2>Current Events</h2>

            <!-- Combined Search Filter -->
            <div style="margin-bottom: 20px; display: flex; align-items: center;">
                <el-select v-model="selectedFilter" placeholder="Select Filter"
                    style="width: 200px; margin-right: 10px;">
                    <el-option label="Event Name" value="title" />
                    <el-option label="Date" value="start" />
                    <el-option label="Location" value="location" />
                </el-select>
                <el-input v-model="searchQuery" placeholder="Enter search term" clearable style="flex: 1;" />
                <el-button type="primary" @click="resetFilters" style="margin-left: 10px;">Clear</el-button>
            </div>

            <!-- Table with Sorting and Pagination -->
            <el-table :data="paginatedEvents" stripe style="width: 100%">
                <el-table-column prop="title" label="Event Name" sortable />
                <el-table-column prop="start" label="Date" sortable />
                <el-table-column prop="location" label="Location" sortable />
                <el-table-column label="Action">
                    <template v-slot="scope">
                        <el-button @click="cancelAppointment(scope.row)" type="danger" v-if="isBooked(scope.row.start)">
                            Cancel
                        </el-button>
                        <el-button @click="bookAppointment(scope.row)" type="primary" v-else>
                            Book Appointment
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- Pagination Controls -->
            <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="pageSize"
                :total="filteredEvents.length" layout="prev, pager, next" style="margin-top: 20px;" />
        </section>

        <!-- Calendar Section -->
        <section class="calendar-section">
            <h2>Event Calendar</h2>
            <FullCalendar ref="calendarRef" :options="calendarOptions" :events="events" @eventClick="handleEventClick"
                style="margin-top: 20px; border: 1px solid black;" />
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../components/NavBar.vue';
import eventsImage from '@/assets/programs-events.jpg';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../data/firebase.js';

const calendarRef = ref(null);
const events = ref([]);
const bookedAppointments = ref([]);  // 用于存储已预定的预约信息

// FullCalendar options
const calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
};

// Load events and user appointments from Firestore
onMounted(async () => {
    await loadEventsFromFirestore();
    await loadUserAppointments();
});

async function loadEventsFromFirestore() {
    const eventsCollection = collection(db, 'events');
    const eventSnapshot = await getDocs(eventsCollection);

    // Load event data
    events.value = eventSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        start: doc.data().start,
        end: doc.data().end || null,
        location: doc.data().location,
        extendedProps: {
            location: doc.data().location
        }
    }));

    console.log("Loaded events:", events.value);
}

async function loadUserAppointments() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
        console.log("User not logged in or email is missing.");
        return;
    }

    const appointmentsRef = collection(db, 'appointments');
    const snapshot = await getDocs(appointmentsRef);
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter for current user's appointments
    const userAppointments = appointments.filter(appointment => appointment.userEmail === user.email);

    // Collect booked appointments and add to calendar
    bookedAppointments.value = userAppointments;  // 保存用户预约信息
    userAppointments.forEach(appointment => {
        const startDate = new Date(appointment.eventStart);
        if (startDate && !isNaN(startDate.getTime())) {
            const eventToAdd = {
                title: appointment.eventTitle,
                start: startDate.toISOString(),
                extendedProps: {
                    location: appointment.eventLocation,
                }
            };
            events.value.push(eventToAdd);
            const calendarApi = calendarRef.value.getApi();
            calendarApi.addEvent(eventToAdd);
        } else {
            console.error("Invalid date for appointment:", appointment);
        }
    });

    console.log("User's booked events:", userAppointments);
}

// Check if the event date is booked
const isBooked = (eventStart) => {
    const eventDate = new Date(eventStart).toISOString().split('T')[0];
    return bookedAppointments.value.some(appointment => {
        const appointmentDate = new Date(appointment.eventStart).toISOString().split('T')[0];
        return appointmentDate === eventDate;
    });
};

// Variables for filtering and pagination
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedFilter = ref('title');

// Filter events
const filteredEvents = computed(() => {
    return events.value.filter(event => {
        const query = searchQuery.value.toLowerCase();
        return event[selectedFilter.value]?.toString().toLowerCase().includes(query);
    });
});

// Paginate events
const paginatedEvents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredEvents.value.slice(start, end);
});

// Handle pagination change
const handleCurrentChange = (page) => {
    currentPage.value = page;
};

// Reset filters
const resetFilters = () => {
    selectedFilter.value = 'title';
    searchQuery.value = '';
};

const bookAppointment = async (event) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
        console.log("User not logged in.");
        return;
    }

    // Create a new appointment in Firestore
    try {
        const docRef = await addDoc(collection(db, 'appointments'), {
            userEmail: user.email,
            eventTitle: event.title,
            eventStart: event.start,
            eventLocation: event.location,
        });
        alert('Appointment booked successfully!');

        // Add the event to the FullCalendar
        const calendarApi = calendarRef.value.getApi();
        calendarApi.addEvent({
            title: event.title,
            start: event.start,
            extendedProps: {
                location: event.location,
            },
        });

        // Navigate to the event's date
        calendarApi.gotoDate(event.start);

        // 更新 bookedAppointments
        bookedAppointments.value.push({
            id: docRef.id,
            userEmail: user.email,
            eventTitle: event.title,
            eventStart: event.start,
            eventLocation: event.location,
        });

    } catch (error) {
        console.error("Error booking appointment:", error);
        alert('Failed to book appointment.');
    }
};

const cancelAppointment = async (event) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
        console.log("User not logged in.");
        return;
    }

    // 找到对应的预约并删除
    const appointmentToCancel = bookedAppointments.value.find(appointment => {
        return appointment.eventTitle === event.title && new Date(appointment.eventStart).toISOString() === new Date(event.start).toISOString();
    });

    if (appointmentToCancel) {
        try {
            // 删除 Firestore 中的预约
            await deleteDoc(doc(db, 'appointments', appointmentToCancel.id));

            // 从 FullCalendar 中移除事件
            const calendarApi = calendarRef.value.getApi();
            const eventToRemove = calendarApi.getEvents().find(e => e.title === event.title && e.startStr === event.start);
            if (eventToRemove) {
                eventToRemove.remove();
            }

            // 从 bookedAppointments 中移除已取消的预约
            bookedAppointments.value = bookedAppointments.value.filter(appointment => appointment.id !== appointmentToCancel.id);

            alert('Appointment cancelled successfully!');
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            alert('Failed to cancel appointment.');
        }
    } else {
        alert('Appointment not found.');
    }
};

</script>

<style scoped>
.introduction-section {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.responsive-image {
    max-width: 100%;
    height: auto;
}
</style>
