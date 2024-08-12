<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="#">Elder in<br> Melbourne</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" href="#">Program and Events</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Support and Services</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Neighborhood Centers</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#"><i class="bi bi-lock"></i></a>
                </li>
            </ul>
        </div>
        <div class="login">
            Login
        </div>
    </nav>
</template>

<script setup>
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

.login{
    color: white;
    font-weight: bold;
}
</style>