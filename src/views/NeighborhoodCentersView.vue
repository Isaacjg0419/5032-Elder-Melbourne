<template>
    <div>
        <Navbar />
        <div class="introduction-section">
            <div class="row">
                <div class="col-12 col-lg-6">
                    <h1>Neighborhood Centers</h1>
                    <p class="introduction-text">
                        Our dedicated neighbourhood centres host a range of social and recreational activities for
                        older people and carers and are popular spaces for local community groups to meet.
                    </p>
                </div>
                <div class="col-12 col-lg-6">
                    <img :src="neighborhoodImage"
                        alt="Neighborhood center offering social and recreational activities for older adults"
                        class="responsive-image" />
                </div>
            </div>
        </div>

        <div class="table-section">
            <h2>Aged Care Centers</h2>

            <div style="margin-bottom: 20px; display: flex; align-items: center;">
                <el-select v-model="selectedFilter" placeholder="Select Filter"
                    style="width: 200px; margin-right: 10px;" aria-label="Select filter for table">
                    <el-option label="Name" value="name" />
                    <el-option label="Address" value="address" />
                    <el-option label="Phone" value="phone" />
                </el-select>
                <el-input v-model="searchQuery" placeholder="Enter search term" clearable style="flex: 1;"
                    aria-label="Search input for table" />
                <el-button type="primary" @click="resetFilters" style="margin-left: 10px;">Clear</el-button>
            </div>

            <el-table :data="filteredCenters" stripe style="width: 100%" @sort-change="handleSortChange"
                :default-sort="{ prop: 'name', order: 'ascending' }">
                <el-table-column prop="name" label="Name" sortable />
                <el-table-column prop="address" label="Address" sortable />
                <el-table-column prop="phone" label="Phone" sortable />
            </el-table>

            <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize"
                :total="totalCenters" layout="prev, pager, next" style="margin-top: 20px;"
                aria-label="Pagination controls for table" />
        </div>

        <div class="map-section">
            <GoogleMap api-key="AIzaSyDaEyQ5hYpaWNvWFWMPo-7vYYt3_Fb9iRE" map-id="26be0c5b828394f8"
                style="width: 100%; height: 400px" :center="mapCenter" :zoom="zoomLevel">
                <AdvancedMarker v-for="(marker, index) in markers" :key="index" :options="marker.options"
                    @click="handleMarkerClick(marker, centers[index])">
                    <InfoWindow v-if="selectedCenter && selectedCenter.id === centers[index].id"
                        :position="selectedCenter.position" @closeclick="handleInfoWindowClose">
                        <div>
                            <p>{{ selectedCenter.name }}</p>
                            <p>{{ selectedCenter.address }}</p>
                            <p>{{ selectedCenter.phone }}</p>
                            <input v-model="startLocation" placeholder="Enter starting location"
                                aria-label="Enter your starting location" />
                            <button @click="getTripInfo(selectedCenter.address)" aria-label="Get trip information">Get
                                Trip Info</button>

                            <div v-if="tripInfo">
                                <h3>Trip Details</h3>
                                <p>Distance: {{ tripInfo.distance }}</p>
                                <p>Duration: {{ tripInfo.duration }}</p>
                                <p>Route: {{ tripInfo.route }}</p>
                            </div>
                            <button @click="navigateTo(selectedCenter.address)"
                                aria-label="Navigate to selected center">Navigate</button>
                        </div>
                    </InfoWindow>
                </AdvancedMarker>
            </GoogleMap>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../components/NavBar.vue';
import { db } from '../data/firebase.js';
import { collection, getDocs } from "firebase/firestore";
import neighborhoodImage from '@/assets/neighborhood.jpg';
import { GoogleMap, AdvancedMarker, InfoWindow } from 'vue3-google-map';

const centers = ref([]);
const selectedFilter = ref('name');
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const sortOrder = ref({ prop: 'name', order: 'ascending' });
const mapCenter = { lat: -37.8136, lng: 144.9631 };
const zoomLevel = 12;
const markers = ref([]);
const selectedCenter = ref(null);
const startLocation = ref("");
const tripInfo = ref(null);

async function fetchCenters() {
    try {
        const centerCollection = collection(db, "agedCareCenters");
        const snapshot = await getDocs(centerCollection);
        centers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        markers.value = centers.value
            .filter(center => center.latitude && center.longitude)
            .map(center => ({
                options: {
                    position: { lat: center.latitude, lng: center.longitude },
                    title: center.name,
                },
            }));
    } catch (error) {
        console.error("Error fetching centers: ", error);
    }
}

function handleMarkerClick(marker, center) {
    selectedCenter.value = { ...center, position: marker.options.position };
    tripInfo.value = null;
}

function handleInfoWindowClose() {
    selectedCenter.value = null;
}

async function getTripInfo(destination) {
    if (!startLocation.value) return;

    const directionsService = new google.maps.DirectionsService();
    const request = {
        origin: startLocation.value,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            const route = result.routes[0];
            tripInfo.value = {
                distance: route.legs[0].distance.text,
                duration: route.legs[0].duration.text,
                route: route.legs[0].steps.map(step => step.instructions.replace(/<[^>]*>/g, '').trim()).join(", "),
            };
        } else {
            tripInfo.value = {
                distance: "N/A",
                duration: "N/A",
                route: "Unable to retrieve directions."
            };
        }
    });
}

function navigateTo(address) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
}

const filteredCenters = computed(() => {
    const filtered = centers.value.filter(center => {
        const searchValue = searchQuery.value.toLowerCase();
        return center[selectedFilter.value].toLowerCase().includes(searchValue);
    });

    if (currentPage.value > Math.ceil(filtered.length / pageSize.value)) {
        currentPage.value = 1;
    }

    return filtered
        .sort((a, b) => {
            const prop = sortOrder.value.prop;
            return sortOrder.value.order === 'ascending' ?
                (a[prop] > b[prop] ? 1 : -1) :
                (a[prop] < b[prop] ? 1 : -1);
        })
        .slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

const totalCenters = computed(() => {
    const filtered = centers.value.filter(center => {
        const searchValue = searchQuery.value.toLowerCase();
        return center[selectedFilter.value].toLowerCase().includes(searchValue);
    });
    return filtered.length;
});

function handlePageChange(newPage) {
    currentPage.value = newPage;
}

function handleSortChange({ prop, order }) {
    sortOrder.value = { prop, order };
}

function resetFilters() {
    searchQuery.value = '';
    selectedFilter.value = 'name';
    currentPage.value = 1;
}

onMounted(() => {
    fetchCenters();
});
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
    width: 100%;
    height: auto;
}

.table-section {
    margin: 20px;
}

.map-section {
    margin: 20px;
}
</style>
