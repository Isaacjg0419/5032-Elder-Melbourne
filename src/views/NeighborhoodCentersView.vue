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
                    <img :src="neighborhoodImage" alt="neighborhoodImage here" class="responsive-image">
                </div>
            </div>
        </div>

        <!-- Aged Care Centers Table -->
        <h2>Aged Care Centers</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Phone</th>
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

        <!-- Google Map -->
        <GoogleMap api-key="AIzaSyDaEyQ5hYpaWNvWFWMPo-7vYYt3_Fb9iRE" style="width: 100%; height: 400px"
            :center="mapCenter" :zoom="zoomLevel">
            <AdvancedMarker v-for="(marker, index) in markers" :key="index" :options="marker.options"
                @click="handleMarkerClick(marker)" />
        </GoogleMap>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../components/NavBar.vue';
import { db } from '../data/firebase.js'; // 导入 Firestore 数据库
import { collection, getDocs } from "firebase/firestore";
import neighborhoodImage from '@/assets/neighborhood.jpg';
import { GoogleMap, AdvancedMarker } from 'vue3-google-map'; // 导入 GoogleMap 和 AdvancedMarker 组件

const centers = ref([]); // 用于存储老年服务中心数据
const mapCenter = { lat: -37.8136, lng: 144.9631 }; // 地图中心点
const zoomLevel = 12; // 地图缩放级别
const markers = ref([]); // 用于存储标记数据

// 从 Firestore 获取数据
async function fetchCenters() {
    try {
        const centerCollection = collection(db, "agedCareCenters");
        const snapshot = await getDocs(centerCollection);
        centers.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // 设置标记数组
        markers.value = centers.value.map(center => ({
            options: {
                position: { lat: center.latitude, lng: center.longitude }, // 确保这些字段在 Firestore 中存在
                title: center.name, // 提示框内容
                label: {
                    text: center.name,
                    color: '#ffffff', // 标签颜色
                    fontSize: '16px',
                },
                // 其他 AdvancedMarker 选项可以在这里添加
            },
        }));
    } catch (error) {
        console.error("获取老年服务中心数据时出错: ", error);
    }
}

// 点击标记时打印标记信息
function handleMarkerClick(marker) {
    console.log('Marker clicked:', marker);
}

// 在组件挂载后调用 fetchCenters
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

.table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.table th,
.table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.table th {
    background-color: #f2f2f2;
}
</style>
