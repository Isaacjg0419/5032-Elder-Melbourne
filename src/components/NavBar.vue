<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="#">Elder in<br>Melbourne</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <router-link :class="{ 'active-link': isActive('/user-home') }" class="nav-link"
                        to="/user-home">Program and Events</router-link>
                </li>
                <li class="nav-item">
                    <router-link :class="{ 'active-link': isActive('/support-services') }" class="nav-link"
                        to="/support-services">Support and Services</router-link>
                </li>
                <li class="nav-item">
                    <router-link :class="{ 'active-link': isActive('/neighborhood-centers') }" class="nav-link"
                        to="/neighborhood-centers">Neighborhood Centers</router-link>
                </li>
            </ul>
        </div>
        <div v-if="user" class="user-info">
            <span>Hi, {{ user.name }}</span>
            <button @click="logout" class="btn btn-danger">Logout</button>
        </div>
        <div v-else class="login">
            <router-link :class="{ 'active-link': isActive('/login') }" class="nav-link" to="/login">Login</router-link>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const user = ref(null)

const isActive = (path) => {
    return route.path === path
}


onMounted(() => {
    const userInfo = localStorage.getItem('user')
    if (userInfo) {
        user.value = JSON.parse(userInfo)
    }
})


const logout = () => {
    localStorage.removeItem('user')
    user.value = null
    router.push('/')
}
</script>

<style scoped>
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
}

.navbar {
    margin: 0;
    width: 100vw;
    padding: 2rem;
    position: relative;
}

.navbar-nav {
    display: flex;
    justify-content: center;
    width: 100%;
}

.navbar-nav .nav-link {
    color: white;
    font-weight: bold;
}

.navbar-nav .nav-link:hover {
    color: #007bff;
    text-decoration: underline;
}

.active-link {
    color: #007bff;
    font-weight: bold;
}

.user-info {
    color: white;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info button {
    background-color: #dc3545;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.login .nav-link {
    color: white;
    font-weight: bold;
}
</style>
