<template>
    <div>
        <Navbar />

        <section class="introduction-section">
            <div class="row">
                <div class="col-12 col-lg-6">
                    <h1>Program and Events</h1>
                    <p class="introduction-text">
                        We offer a range of activities for older people, both in <br>person and online.
                    </p>
                </div>
                <div class="col-12 col-lg-6">
                    <img :src="eventsImage" alt="An image showing events information available for older adults"
                        class="responsive-image" />
                </div>
            </div>
        </section>

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
                <el-table-column prop="location" label="Location" sortable /> <!-- Added sortable prop -->
                <el-table-column label="Action">
                    <template v-slot="scope">
                        <el-button @click="bookAppointment(scope.row)" type="primary">Book Appointment</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- Pagination Controls -->
            <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="pageSize"
                :total="filteredEvents.length" layout="prev, pager, next" style="margin-top: 20px;" />
        </section>

        <section class="calendar-section">
            <h2>Event Calendar</h2>
            <FullCalendar :options="calendarOptions" :events="events" @eventClick="handleEventClick"
                style="margin-top: 20px; border: 1px solid black;" />
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../components/NavBar.vue';
import eventsImage from '@/assets/program-events.jpg';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../data/firebase.js'; // Import Firebase config

const events = ref([]);

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

// Load events from Firestore on component mount
onMounted(async () => {
    await loadEventsFromFirestore(); // Load data from Firestore
});

// Load event data from Firestore
async function loadEventsFromFirestore() {
    const eventsCollection = collection(db, 'events');
    const eventSnapshot = await getDocs(eventsCollection);
    events.value = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedFilter = ref('title'); // Default selected filter
const selectedSort = ref('title'); // Default sort field
const sortOrder = ref('ascending'); // Default sort order

// Filter events based on search query and selected filter
const filteredEvents = computed(() => {
    return events.value.filter(event => {
        const query = searchQuery.value.toLowerCase();
        return event[selectedFilter.value].toString().toLowerCase().includes(query);
    });
});

// Sort events based on selected sort field and order
const sortedEvents = computed(() => {
    const sorted = [...filteredEvents.value].sort((a, b) => {
        const aValue = a[selectedSort.value];
        const bValue = b[selectedSort.value];

        // Check if sorting by date
        if (selectedSort.value === 'start') {
            return new Date(aValue) - new Date(bValue); // Sort by date
        }

        // Default sorting for string values
        if (sortOrder.value === 'ascending') {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });

    return sorted;
});

// Paginate sorted events
const paginatedEvents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return sortedEvents.value.slice(start, start + pageSize.value);
});

// Handle pagination changes
function handleCurrentChange(page) {
    currentPage.value = page;
}

// Reset filters
function resetFilters() {
    searchQuery.value = '';
    selectedFilter.value = 'title'; // Reset to default filter
    selectedSort.value = 'title'; // Reset to default sort field
    currentPage.value = 1; // Reset to page 1
}

// Book appointment
function bookAppointment(event) {
    alert(`You have booked an appointment for: ${event.title} on ${event.start}`);
}

// Calendar event click handler
function handleEventClick(info) {
    alert(`Event: ${info.event.title}\nDate: ${info.event.start}\nLocation: ${info.event.extendedProps.location}`);
}
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
    margin-left: 10px;
    width: 100%;
    height: auto;
    object-fit: cover;
}

.events-section,
.calendar-section {
    margin: 20px;
}

.search-input {
    margin-bottom: 20px;
}
</style>
