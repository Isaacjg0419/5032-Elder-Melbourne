<template>
    <div>
        <Navbar />

        <!-- Introduction Section -->
        <section class="introduction-section">
            <div class="row">
                <div class="col-12 col-lg-6">
                    <h1>Program and Events</h1>
                    <p class="introduction-text">
                        We offer a range of activities for older people, both<br> in person and online.
                    </p>
                </div>
                <div class="col-12 col-lg-6">
                    <img :src="eventsImage" alt="An image showing events information available for older adults"
                        class="responsive-image" role="img" aria-label="Events information for older adults" />
                </div>
            </div>
        </section>

        <!-- Events Section -->
        <section class="events-section">
            <h2>Current Events</h2>

            <!-- Combined Search Filter -->
            <div style="margin-bottom: 20px; display: flex; align-items: center;">
                <el-select v-model="selectedFilter" placeholder="Select Filter"
                    style="width: 200px; margin-right: 10px;" aria-label="Event filter selection">
                    <el-option label="Event Name" value="title" />
                    <el-option label="Date" value="start" />
                    <el-option label="Location" value="location" />
                </el-select>
                <el-input v-model="searchQuery" placeholder="Enter search term" clearable style="flex: 1;"
                    aria-label="Search events" />
                <el-button type="primary" @click="resetFilters" style="margin-left: 10px;" aria-label="Clear filters">
                    Clear
                </el-button>
            </div>

            <!-- Table with Sorting and Pagination -->
            <el-table :data="paginatedEvents" stripe style="width: 100%">
                <el-table-column prop="title" label="Event Name" sortable />
                <el-table-column prop="start" label="Date" sortable />
                <el-table-column prop="location" label="Location" sortable />
                <el-table-column label="Action">
                    <template v-slot="scope">
                        <el-button @click="cancelAppointment(scope.row)" type="danger" v-if="isBooked(scope.row.start)"
                            aria-label="Cancel appointment">
                            Cancel
                        </el-button>
                        <el-button @click="bookAppointment(scope.row)" type="primary" v-else
                            aria-label="Book appointment">
                            Book Appointment
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- Pagination Controls -->
            <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="pageSize"
                :total="filteredEvents.length" layout="prev, pager, next" style="margin-top: 20px;"
                aria-label="Pagination" />
        </section>

        <!-- Calendar Section -->
        <section class="calendar-section">
            <div class="export-button-container">
                <h2>Event Calendar</h2>
                <el-button type="primary" @click="exportCalendarToPDF" class="export-button"
                    aria-label="Export calendar to PDF">
                    Export Calendar to PDF
                </el-button>
            </div>
            <FullCalendar ref="calendarRef" :options="calendarOptions" :events="events" @eventClick="handleEventClick"
                style="margin-top: 20px; border: 1px solid black; border-radius: 5px;" aria-label="Event calendar" />
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const calendarRef = ref(null);
const events = ref([]);
const bookedAppointments = ref([]);

const exportCalendarToPDF = () => {
    const doc = new jsPDF();

    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user ? user.name : 'Guest';

    doc.setFontSize(16);
    doc.text(`Hi, Dear User: ${userName}`, 14, 40);
    doc.text('Here are your Current Bookings:', 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = bookedAppointments.value.map(appointment => [
        appointment.eventTitle,
        new Date(appointment.eventStart).toLocaleString(),
        appointment.eventLocation,
    ]);

    doc.autoTable({
        head: [['Event Title', 'Event Start', 'Event Location']],
        body: tableData,
        startY: 50,
    });

    doc.save('calendar_bookings.pdf');
};

const calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
};

onMounted(async () => {
    await loadEventsFromFirestore();
    await loadUserAppointments();
});

async function loadEventsFromFirestore() {
    const eventsCollection = collection(db, 'events');
    const eventSnapshot = await getDocs(eventsCollection);

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

    const userAppointments = appointments.filter(appointment => appointment.userEmail === user.email);

    bookedAppointments.value = userAppointments;
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

const isBooked = (eventStart) => {
    const eventDate = new Date(eventStart).toISOString().split('T')[0];
    return bookedAppointments.value.some(appointment => {
        const appointmentDate = new Date(appointment.eventStart).toISOString().split('T')[0];
        return appointmentDate === eventDate;
    });
};

const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedFilter = ref('title');

const filteredEvents = computed(() => {
    return events.value.filter(event => {
        const query = searchQuery.value.toLowerCase();
        return event[selectedFilter.value]?.toString().toLowerCase().includes(query);
    });
});

const paginatedEvents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredEvents.value.slice(start, end);
});

const handleCurrentChange = (page) => {
    currentPage.value = page;
};

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

    try {
        const docRef = await addDoc(collection(db, 'appointments'), {
            userEmail: user.email,
            eventTitle: event.title,
            eventStart: event.start,
            eventLocation: event.location,
        });
        alert('Appointment booked successfully!');

        const calendarApi = calendarRef.value.getApi();
        calendarApi.addEvent({
            title: event.title,
            start: event.start,
            extendedProps: {
                location: event.location,
            },
        });

        calendarApi.gotoDate(event.start);

        bookedAppointments.value.push({
            id: docRef.id,
            eventTitle: event.title,
            eventStart: event.start,
            eventLocation: event.location,
            userEmail: user.email,
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

    const appointment = bookedAppointments.value.find(appointment => appointment.eventTitle === event.title);
    if (!appointment) return;

    try {
        await deleteDoc(doc(db, 'appointments', appointment.id));
        alert('Appointment cancelled successfully!');

        bookedAppointments.value = bookedAppointments.value.filter(a => a.id !== appointment.id);

        const calendarApi = calendarRef.value.getApi();
        const eventToRemove = calendarApi.getEventById(appointment.id);
        if (eventToRemove) {
            eventToRemove.remove();
        }
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert('Failed to cancel appointment.');
    }
};
</script>

<style scoped>
.introduction-section {
    margin-top: 20px;
    padding: 20px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.introduction-text {
    padding: 20px;
    max-width: 800px;
}

.responsive-image {
    max-width: 100%;
    height: auto;
}

.export-button-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.events-section,
.calendar-section {
    padding: 0 20px;
    /* 为两侧添加间距 */
}

.export-button-container {
    display: flex;
    justify-content: space-between;
    /* 在同一行中分开 */
    align-items: center;
    /* 垂直居中对齐 */
    margin-top: 20px;
    /* 顶部间距 */
}

.export-button {
    margin-left: 10px;
    /* 按钮与标题之间的间距 */
}
</style>
