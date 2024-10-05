<template>
    <div>
        <Navbar />
        <div class="introduction-section">
            <div class="row">
                <div class="col-12 col-lg-6">
                    <h1>Neighborhood Centers</h1>
                    <p class="introduction-text">
                        Our dedicated neighbourhood centres host a range of<br> social and recreational activities for
                        older people and<br> carers and are popular spaces for local community groups<br> to meet.
                    </p>
                </div>
                <div class="col-12 col-lg-6">
                    <img :src="neighborhoodImage"
                        alt="Image of a neighborhood center offering social and recreational activities for older adults"
                        class="responsive-image">
                </div>
            </div>
        </div>
        <div class="table-section">
            <!-- Aged Care Centers Table -->
            <h2>Aged Care Centers</h2>
            <table class="table" role="table">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Address</th>
                        <th scope="col">Phone</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(center, index) in centers" :key="index">
                        <td>{{ center.name }}</td>
                        <td>{{ center.address }}</td>
                        <td>{{ center.phone }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="map-section">
            <!-- Google Map -->
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
                            <!-- Trip Info Input -->
                            <input v-model="startLocation" placeholder="Enter starting location"
                                aria-label="Enter your starting location" />
                            <button @click="getTripInfo(selectedCenter.address)" aria-label="Get trip information">Get
                                Trip
                                Info</button>

                            <div v-if="tripInfo">
                                <h3>Trip Details</h3>
                                <p>Distance: {{ tripInfo.distance }}</p>
                                <p>Duration: {{ tripInfo.duration }}</p>
                                <p>Route: {{ tripInfo.route }}</p>
                            </div>
                            <!-- Navigate Button -->
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
import { ref, onMounted } from 'vue';
import Navbar from '../components/NavBar.vue';
import { db } from '../data/firebase.js';
import { collection, getDocs } from "firebase/firestore";
import neighborhoodImage from '@/assets/neighborhood.jpg';
import { GoogleMap, AdvancedMarker, InfoWindow } from 'vue3-google-map';

const centers = ref([]);
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
        centers.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        markers.value = centers.value
            .filter(center => center.latitude && center.longitude)
            .map(center => ({
                options: {
                    position: { lat: center.latitude, lng: center.longitude },
                    title: center.name,
                },
            }));
    } catch (error) {
        console.error("get centers errors ", error);
    }
}

function handleMarkerClick(marker, center) {
    selectedCenter.value = {
        ...center,
        position: marker.options.position
    };
    // refresh trip info
    tripInfo.value = null;
}

function handleInfoWindowClose() {
    selectedCenter.value = null;
}

// get trip info
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
                //route response parse the HTML 
                route: route.legs[0].steps.map(step => {
                    return step.instructions
                        .replace(/<\/?b>/g, '')
                        .replace(/<\/?wbr>/g, '')
                        .replace(/<[^>]*>/g, '')
                        .trim();
                }).join(", "),
            };
        } else {
            console.error('Error fetching directions:', status);
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
    margin-left: 10px;
    width: 100%;
    height: auto;
    object-fit: cover;
}


@media (min-width: 992px) {
    .introduction-section {
        flex-direction: row;
    }

    .introduction-section h1 {
        font-size: 2.5rem;
    }

    .introduction-text p {
        font-size: 1.25rem;
    }
}

@media (max-width: 768px) {
    .introduction-section {
        flex-direction: column;
        text-align: center;
    }

    .introduction-text {
        margin: 0;
        padding: 10px;
        max-width: none;
    }

    .responsive-image {
        margin: 0;
        width: 100%;
    }

}

.table-section,
.map-section {
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 40px;
}

.table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.table th {
    background-color: #4a4a4a;
    color: #ffffff;
}

.table td {
    color: #333333;
}

GoogleMap {
    margin-top: 40px;
}
</style>
