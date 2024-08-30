<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="#">Elder in<br>Melbourne</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
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
                    <router-link :class="{ 'active-link': isActive('/user-home') }" class="nav-link"
                        to="/user-home">Neighborhood Centers</router-link>
                </li>
                <li class="nav-item">
                    <router-link :class="{ 'active-link': isActive('/login') }" class="nav-link" to="/login"><i
                            class="bi bi-lock"></i></router-link>
                </li>
            </ul>
        </div>
        <div class="login">
            <router-link :class="{ 'active-link': isActive('/') }" class="nav-link" to="/">Login</router-link>
        </div>
    </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path) => {
    return route.path === path
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

.container {
    margin-top: 0;
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

.login .nav-link {
    color: white;
    font-weight: bold;
}
</style>