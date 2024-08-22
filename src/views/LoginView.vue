<template>
    <div class="login-container">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" v-model="email" required />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" v-model="password" required />
            </div>

            <div class="form-group">
                <label for="role">Select Role</label>
                <select v-model="role" required>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <button type="submit">Login</button>
        </form>

        <div v-if="submitted">
            <h3>Submitted Data:</h3>
            <p>Email: {{ email }}</p>
            <p>Password: {{ password }}</p>
            <p>Role: {{ role }}</p>
        </div>
        <div class="register-link">
            <p>Don't have an account? <a href="/register">Register a new one</a></p>
        </div>
    </div>
</template>

<script>
// TODO:change the accounts.json as the firebase 
import accounts from '../data/accounts.json'; 

export default {
    data() {
        return {
            email: "",
            password: "",
            // Default role as user
            role: "user", 
            // Flag to show submitted data
            submitted: false, 
        };
    },
    methods: {
        handleLogin() {
            this.submitted = true;
            const account = accounts.accounts.find(acc =>
                acc.email === this.email &&
                acc.password === this.password &&
                acc.role === this.role
            );

            if (account) {
                //if Successful login
                alert("Login successful!");
                // Simulate navigation based on role
                if (this.role === "admin") {
                    this.$router.push('/admin-dashboard'); 
                    // TODO:define the admin-dashboard
                } else {
                    this.$router.push('/user-home'); 
                    // TODO:define the user-home
                }
            } else {
                // Failed login
                alert("Invalid account information. Please check your credentials or register.");
            }
        },
    },
};
</script>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
}

input,
select {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
}

button {
    width: 100%;
    padding: 0.7rem;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}
</style>
