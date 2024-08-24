<template>
  <div>
    <Navbar />
    <div class="introduction-section">
      <div class="row">
        <div class="col-6">
          <h1>Elder Community Introduction</h1>
          <p style="padding-left:40px;margin-top: 20px;">
            The City of Melbourne offers a range of programs and<br>
            services to support older people to remain active, independent and living at home.​
          </p>
        </div>
        <div class="col-6">
          <img :src="oldPeopleImage" alt="old-people here" class="responsive-image">
        </div>
      </div>
    </div>
    <div class="explore-section">
      <h2>Explore</h2>
      <div class="card-container">
        <router-link v-for="(card, index) in cardData" :key="index" :to="card.link" class="card">
          <img :src="imageMap[card.image]" :alt="card.title" class="card-image" />
          <p class="card-text">{{ card.text }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import oldPeople from '@/assets/older-people.jpg';
import Navbar from '../components/NavBar.vue';
import cardsData from '@/data/explore-cards.json';

// Import all images from the assets folder
const imageFiles = import.meta.glob('@/assets/*.jpg', { eager: true });

const oldPeopleImage = oldPeople;
const cardData = ref([]);
const imageMap = ref({});

// Create a map for image paths
onMounted(() => {
  cardData.value = cardsData;
  imageMap.value = Object.keys(imageFiles).reduce((map, path) => {
    const key = path.split('/').pop();
    map[key] = imageFiles[path].default;
    return map;
  }, {});
});
</script>

<style scoped>
.introduction-section {
  margin-top: 20px;
  padding: 20px;
}

.responsive-image {
  margin-left: 10px;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.explore-section {
  margin-top: 40px;
  padding: 20px;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: 30%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-title {
  font-size: 1.2rem;
  margin: 10px;
}

.card-text {
  font-size: 1rem;
  margin: 10px;
}
</style>
