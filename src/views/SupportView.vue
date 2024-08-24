<template>
    <div>
        <Navbar />
        <div class="introduction-section">
            <div class="row">
                <div class="col-6">
                    <h1>Services and Support</h1>
                    <p style="padding-left:40px;margin-top: 20px;">
                        When you or your loved ones need support, it can be hard<br>
                        to know who to turn to. The information on this page<br>
                        offers a starting point for older people, their carers and families to access
                        the support, information and services they need.
                    </p>
                </div>
                <div class="col-6">
                    <img :src="supportsImage" alt="supports here" class="responsive-image">
                </div>
            </div>
        </div>
        <div class="explore-section">
            <h2>Common FAQs</h2>
            <div class="card-container">
                <div v-for="(faq, index) in faqList" :key="index" class="card">
                    <h3 class="card-title">{{ faq.question }}</h3>
                    <p class="card-text">{{ faq.answer }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'; // Import ref from Vue
import supportsImage from '@/assets/services-supports.jpg'; // Correct import path
import faqsData from '@/data/common-faqs.json'; // Correct import path

const faqList = ref(faqsData); // Use ref to create a reactive reference
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
    width: 100%;
    max-width: 600px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.card-title {
    font-size: 1.2rem;
    margin-bottom: 10px;
}

.card-text {
    font-size: 1rem;
}
</style>