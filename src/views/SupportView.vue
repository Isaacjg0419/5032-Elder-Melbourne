<template>
    <div>
        <Navbar />
        <div class="introduction-section">
            <div class="row">
                <div class="col-12 col-lg-6">
                    <h1>Services and Support</h1>
                    <p class="introduction-text">
                        When you or your loved ones need support, it can be hard<br>
                        to know who to turn to. The information on this page<br>
                        offers a starting point for older people, their carers and families to access
                        the support, information and services they need.
                    </p>
                </div>
                <div class="col-12 col-lg-6">
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
                                    <span>Average Rating: {{ Number(faqRatings[index]?.avgRating).toFixed(1) || 'N/A'
                                        }}</span>
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
                                        :class="{ 'btn-primary': userRating[index] === rating, 'btn-outline-secondary': userRating[index] !== rating }"
                                        class="btn mx-1" @click="rateFaq(index, rating)"
                                        :disabled="showThankYou[index] && userRating[index] !== rating">
                                        {{ rating }}
                                    </button>
                                </div>
                            </div>
                            <div class="col-12 col-md-4 text-start text-md-end" v-if="showThankYou[index]">
                                <div class="thank-you-message">
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
import { doc, getDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import supportsImage from '@/assets/services-supports.jpg';
// import faqsData from '@/data/common-faqs.json';

const faqList = ref([]);
const expandedFaqs = ref([]);
const faqRatings = ref([]);
const userRating = ref([]);
const showThankYou = ref([]);


const toggleFaq = (index) => {
    expandedFaqs.value[index] = !expandedFaqs.value[index];
};

const fetchFaqRatings = async () => {
    try {
        const faqsSnapshot = await getDocs(collection(db, 'faqs'));
        const idMap = new Map();

        // Extract data and map it
        faqsSnapshot.forEach((doc) => {
            const faqData = doc.data();
            const docId = doc.id;
            idMap.set(docId, {
                avgRating: faqData.avgRating || 0,
                totalRatings: faqData.totalRatings || 0,
                ratingCount: faqData.ratingCount || 0
            });

            // Populate FAQ list with Firestore data
            faqList.value.push({
                id: docId,
                question: faqData.question || '',
                answer: faqData.answer || '',
                ratingData: {
                    avgRating: faqData.avgRating || 0,
                    totalRatings: faqData.totalRatings || 0,
                    ratingCount: faqData.ratingCount || 0
                }
            });
        });

        // Initialize expandedFaqs, faqRatings, userRating, and showThankYou based on the new faqList
        expandedFaqs.value = faqList.value.map(() => false);
        faqRatings.value = faqList.value.map(faq => faq.ratingData);
        userRating.value = faqList.value.map(() => null);
        showThankYou.value = faqList.value.map(() => false);

    } catch (error) {
        console.error('Error fetching FAQ ratings:', error);
    }
};


const rateFaq = async (index, rating) => {
    try {
        const faq = faqList.value[index];

        if (!faq || !faq.id) {
            throw new Error('FAQ data not found');
        }

        const docRef = doc(db, 'faqs', faq.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Document not found in Firestore');
        }

        let currentData = docSnap.data();
        const newRatingCount = (currentData.ratingCount || 0) + 1;
        const newTotalRatings = (currentData.totalRatings || 0) + rating;
        const newAvgRating = newTotalRatings / newRatingCount;

        await updateDoc(docRef, {
            avgRating: newAvgRating,
            totalRatings: newTotalRatings,
            ratingCount: newRatingCount,
        });

        faqRatings.value[index] = {
            avgRating: newAvgRating.toFixed(1),
            totalRatings: newTotalRatings,
            ratingCount: newRatingCount
        };
        userRating.value[index] = rating;
        showThankYou.value[index] = true;

        // Disable all rating buttons except the selected one
        const buttons = document.querySelectorAll(`.faqs-list:nth-child(${index + 1}) .rating-buttons button`);
        buttons.forEach(button => {
            const buttonRating = parseInt(button.textContent);
            button.disabled = buttonRating !== rating;
        });

    } catch (error) {
        console.error('Error updating FAQ rating:', error);
    }
};




onMounted(() => {
    fetchFaqRatings();
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
    cursor: pointer;
}

.rating-buttons button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.thank-you-message {
    margin-top: 1rem;
    font-size: 1rem;
    color: #28a745;
}
</style>
