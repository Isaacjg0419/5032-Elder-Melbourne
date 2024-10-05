<template>
  <div>
    <Navbar />
    <!-- Main content section -->
    <main aria-label="Elder Community Introduction and Explore Section">
      <!-- Introduction section -->
      <section class="introduction-section" aria-labelledby="introduction-title">
        <div class="row">
          <div class="col-12 col-lg-6">
            <h1 id="introduction-title">Elder Community Introduction</h1>
            <p class="introduction-text">
              The City of Melbourne offers a range of programs and<br />
              services to support older people to remain active, independent and living at home.​
            </p>
          </div>
          <div class="col-12 col-lg-6">
            <img :src="oldPeopleImage" alt="Older people engaging in activities" class="responsive-image" />
          </div>
        </div>
      </section>

      <!-- Explore section -->
      <section class="explore-section" aria-labelledby="explore-title">
        <h2 id="explore-title">Explore</h2>
        <div class="card-container">
          <router-link v-for="(card, index) in cardData" :key="index" :to="card.link" class="card"
            :aria-label="card.text">
            <img :src="imageMap[card.image]" :alt="card.title" class="card-image" />
            <p class="card-text">{{ card.text }}</p>
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import oldPeople from '@/assets/older-people.jpg';
import Navbar from '../components/NavBar.vue';
import cardsData from '@/data/explore-cards.json';

// Image imports and data
const imageFiles = import.meta.glob('@/assets/*.jpg', { eager: true });
const oldPeopleImage = oldPeople;
const cardData = ref([]);
const imageMap = ref({});

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

.explore-section {
  margin-top: 40px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.explore-section h2 {
  margin-bottom: 20px;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: 30%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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

  .card-container {
    flex-direction: column;
  }

  .card {
    width: 100%;
  }
}
</style>
