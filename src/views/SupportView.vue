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

        <div class="faqs-section">
            <h2>Common FAQs</h2>
            <div class="faqs-container">
                <div v-for="(faq, index) in faqList" :key="index" class="faqs-list">
                    <div class="faqs-title" @click="toggleFaq(index)" :class="{ active: expandedFaqs[index] }">
                        <span>{{ faq.question }}</span>
                        <span class="arrow" :class="{ open: expandedFaqs[index] }">▼</span>
                    </div>
                    <p v-show="expandedFaqs[index]" class="faqs-text">{{ faq.answer }}</p>
                    <div v-show="expandedFaqs[index]" class="rating-section">
                        <div class="row" style="margin-right: 2rem;">
                            <div class="col-12">
                                <div class="d-flex align-items-center mb-2 mb-md-0">
                                    <span>Average Rating: {{ faqRatings[index]?.avgRating.toFixed(1) || 'N/A' }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 col-md-4">
                                <div>Think this Q&A is helpful? Rate this FAQ:</div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="rating-buttons d-flex">
                                    <button v-for="rating in [1, 2, 3, 4, 5]" :key="rating"
                                        :class="{ 'btn-primary': userRating[index] === rating }"
                                        class="btn btn-outline-secondary mx-1" @click="rateFaq(index, rating)">
                                        {{ rating }}
                                    </button>
                                </div>
                            </div>
                            <div class="col-12 col-md-4 text-center text-md-start">
                                <div v-if="showThankYou[index]" class="thank-you-message">
                                    Thank you for your rating!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Navbar from '../components/NavBar.vue';
import { ref, onMounted } from 'vue';
import { db } from '@/data/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import supportsImage from '@/assets/services-supports.jpg';
import faqsData from '@/data/common-faqs.json';

const faqList = ref(faqsData);
const expandedFaqs = ref(faqList.value.map(() => false));
const faqRatings = ref([]);
const userRating = ref(faqList.value.map(() => null));
const showThankYou = ref(faqList.value.map(() => false));

const toggleFaq = (index) => {
    expandedFaqs.value[index] = !expandedFaqs.value[index];
};

const fetchFaqRatings = async () => {
    for (let i = 0; i < faqList.value.length; i++) {
        const docRef = doc(db, 'faqRatings', `faq-${i}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            faqRatings.value[i] = docSnap.data();
        } else {
            faqRatings.value[i] = { avgRating: 0, totalRatings: 0, ratingCount: 0 };
        }
    }
};

const rateFaq = async (index, rating) => {
    const docRef = doc(db, 'faqRatings', `faq-${index}`);
    const docSnap = await getDoc(docRef);

    let currentData = { avgRating: 0, totalRatings: 0, ratingCount: 0 };

    if (docSnap.exists()) {
        currentData = docSnap.data();
    }

    const newRatingCount = currentData.ratingCount + 1;
    const newTotalRatings = currentData.totalRatings + rating;
    const newAvgRating = newTotalRatings / newRatingCount;

    await setDoc(docRef, {
        avgRating: newAvgRating,
        totalRatings: newTotalRatings,
        ratingCount: newRatingCount,
    });

    faqRatings.value[index] = { avgRating: newAvgRating.toFixed(1), totalRatings: newTotalRatings, ratingCount: newRatingCount };
    userRating.value[index] = rating;

    // Ensure the thank you message is displayed only after the rating is successfully stored
    showThankYou.value[index] = true;
};

onMounted(() => {
    fetchFaqRatings();
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

.faqs-section {
    margin-top: 40px;
    padding: 20px;
}

.faqs-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.faqs-list {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 10px;
}

.faqs-title {
    font-size: 1.2rem;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f0f0f0;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
}

.faqs-title.active {
    background-color: #e0e0e0;
}

.faqs-text {
    font-size: 1rem;
    padding: 10px;
    transition: all 0.3s ease;
}

.rating-section {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-top: 1rem;
}

.rating-buttons button {
    min-width: 40px;
    height: 40px;
}

.thank-you-message {
    margin-top: 1rem;
    font-size: 1rem;
    color: #28a745;
}
</style>
