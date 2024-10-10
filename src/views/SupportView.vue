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
                    <img :src="supportsImage" alt="An image showing support services available for older adults"
                        class="responsive-image" />
                </div>
            </div>
        </div>
        <div class="faqs-section">
            <h2>Common FAQs</h2>
            <div class="faqs-container">
                <div v-for="(faq, index) in currentFaqs" :key="index" class="faqs-list">
                    <div class="faqs-title" @click="toggleFaq(index)" :aria-expanded="expandedFaqs[index]"
                        :id="'faq-title-' + index" :class="{ active: expandedFaqs[index] }" tabindex="0"
                        @keydown.enter="toggleFaq(index)" @keydown.space.prevent="toggleFaq(index)" role="button"
                        aria-controls="'faq-text-' + index">
                        <span>{{ faq.question }}</span>
                        <span class="arrow" :class="{ open: expandedFaqs[index] }">▼</span>
                    </div>
                    <p v-show="expandedFaqs[index]" :id="'faq-text-' + index" :aria-labelledby="'faq-title-' + index"
                        class="faqs-text">
                        {{ faq.answer }}
                    </p>
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
                                        :disabled="showThankYou[index] && userRating[index] !== rating"
                                        :aria-label="'Rate this FAQ ' + rating + ' stars'" tabindex="0">
                                        {{ rating }}
                                    </button>
                                </div>
                            </div>
                            <div class="col-12 col-md-4 text-start text-md-end" v-if="showThankYou[index]">
                                <div class="thank-you-message" aria-live="polite">
                                    Thank you for your rating!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination controls -->
            <el-pagination :current-page="currentPage" :page-size="pageSize" :total="faqList.length"
                @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background />

            <!-- post question sections -->
            <div class="question-section">
                <h3>Ask a Question with Gemini-AI</h3>
                <input v-model="userQuestion" type="text" placeholder="Type your question here" class="question-input"
                    style="margin-top: 20px;" aria-label="Type your question" />
                <button @click="submitQuestion" class="btn btn-primary" style="margin-top: 20px;"
                    aria-label="Submit your question">Submit</button>
                <div v-if="response" class="response-section">
                    <h4>Response:</h4>
                    <p>{{ response }}</p>
                    <div class="satisfaction-section">
                        <p>**Are you satisfied with this response?**</p>
                        <button @click="handleSatisfaction(true)" class="btn btn-success"
                            aria-label="Yes, I am satisfied">Yes</button>
                        <button @click="handleSatisfaction(false)" class="btn btn-danger" style="margin-left: 10px;"
                            aria-label="No, I am not satisfied">No</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Navbar from '../components/NavBar.vue';
import { ref, onMounted, computed } from 'vue';
import { db } from '@/data/firebase';
import { doc, getDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import supportsImage from '@/assets/services-supports.jpg';

const faqList = ref([]);
const expandedFaqs = ref([]);
const faqRatings = ref([]);
const userRating = ref([]);
const showThankYou = ref([]);
const userQuestion = ref('');
const response = ref('');

// Pagination variables
const currentPage = ref(1);
const itemsPerPage = 10;

// Computed property to get current FAQs for the page
const currentFaqs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return faqList.value.slice(start, end);
});

const toggleFaq = (index) => {
    expandedFaqs.value[index] = !expandedFaqs.value[index];
};

const fetchFaqRatings = async () => {
    try {
        const faqsSnapshot = await getDocs(collection(db, 'faqs'));
        faqList.value = [];
        faqsSnapshot.forEach((doc) => {
            const faqData = doc.data();
            faqList.value.push({
                id: doc.id,
                question: faqData.question || '',
                answer: faqData.answer || '',
                ratingData: {
                    avgRating: faqData.avgRating || 0,
                    totalRatings: faqData.totalRatings || 0,
                    ratingCount: faqData.ratingCount || 0
                }
            });
        });

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

    } catch (error) {
        console.error('Error updating FAQ rating:', error);
    }
};

const submitQuestion = async () => {
    if (!userQuestion.value) return;

    try {
        const apiKey = "AIzaSyDI1T8gJRzjevz9V2sfvkYmzQP0Bdit7wY";
        const prompt = `You are an expert in elder care. Please provide a concise and informative answer to the following question: ${userQuestion.value}`;
        const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 150,
                n: 1,
                stop: null,
                temperature: 0.7
            })
        });

        const data = await response.json();
        response.value = data.choices[0].text.trim();
    } catch (error) {
        console.error('Error fetching response from OpenAI:', error);
    }
};

// Pagination methods
const handlePageChange = (newPage) => {
    currentPage.value = newPage;
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
    max-width: 600px;
}

.responsive-image {
    width: 100%;
    height: auto;
}

.faqs-section {
    margin: 30px 20px;
}

.faqs-list {
    margin: 10px 0;
}

.faqs-title {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #e0e0e0;
    color: #333;
}

.faqs-text {
    padding: 10px;
    background-color: #f2f2f2;
    border-radius: 5px;
    color: #333;
}

.rating-section {
    padding: 10px;
    background-color: #b3e5fc;
    border-radius: 5px;
}

.rating-buttons .btn {
    margin-right: 5px;
}

.question-section {
    margin-top: 30px;
    margin-left: 10px;
    margin-right: 10px;
}

.question-input {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    background-color: #ffffff;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.response-section {
    margin-top: 20px;
    background-color: #b2ebf2;
    padding: 10px;
    border-radius: 5px;
    color: #333;
}
</style>
