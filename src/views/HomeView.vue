<template>
  <div>
    <Navbar />
    <div class="introduction-section">
      <div class="row">
        <div class="col-6">
          <h1>Elder Community Introduction</h1>
          <p style="padding-left:40px;margin-top: 20px;">The City of Melbourne offers a range of programs and<br> services to support older people to remain active,
            independent and living at home.​</p>
        </div>
        <div class="col-6">
          <img :src="oldPeople" alt="old-people here" class="responsive-image">
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import oldPeople from '@/assets/older-people.jpg';
import Navbar from '../components/NavBar.vue'
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
</style>
