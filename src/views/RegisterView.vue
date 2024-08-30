<template>
    <div class="register-container">
        <h2>Register</h2>
        <form @submit.prevent="handleRegister">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" v-model="email" @input="validateEmail" required />
                <p v-if="emailError" class="error">{{ emailError }}</p>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <div class="password-container">
                    <input :type="showPassword ? 'text' : 'password'" v-model="password" @input="validatePassword"
                        required />
                    <span @click="togglePasswordVisibility" class="show-password-button">
                        {{ showPassword ? 'Hide' : 'Show' }}
                    </span>
                </div>
                <p v-if="passwordError" class="error">{{ passwordError }}</p>
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirmed Password</label>
                <div class="password-container">
                    <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword"
                        @input="validateConfirmPassword" required />
                    <span @click="togglePasswordVisibility" class="show-password-button">
                        {{ showPassword ? 'Hide' : 'Show' }}
                    </span>
                </div>
                <p v-if="confirmPasswordError" class="error">{{ confirmPasswordError }}</p>
            </div>

            <label for="role">Select Role</label>
            <select class="form-select form-select-sm" v-model="role" required
                style="margin-top: 1rem; margin-bottom: 1rem;">
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>

            <button type="submit">Register</button>
        </form>
        <div class="login-link">
            Already have an email account? <router-link to="/">Login</router-link>
        </div>
    </div>
</template>


<script>
import { db, auth } from '../data/firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default {
    data() {
        return {
            email: "",
            password: "",
            confirmPassword: "",
            role: "user",
            emailError: "",
            passwordError: "",
            confirmPasswordError: "",
            showPassword: false,
        };
    },
    methods: {
        validateEmail() {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regex.test(this.email)) {
                this.emailError = "Invalid email format.";
            } else {
                this.emailError = "";
            }
        },
        validatePassword() {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!regex.test(this.password)) {
                this.passwordError = "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.";
            } else {
                this.passwordError = "";
            }
        },
        validateConfirmPassword() {
            if (this.password !== this.confirmPassword) {
                this.confirmPasswordError = "Passwords do not match.";
            } else {
                this.confirmPasswordError = "";
            }
        },
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        async handleRegister() {
            if (this.emailError || this.passwordError || this.confirmPasswordError) {
                alert("Please correct the errors before submitting.");
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;

                // Save user data to Firestore
                const collectionName = this.role === "admin" ? "admins" : "users";
                await addDoc(collection(db, collectionName), {
                    email: this.email,
                    role: this.role,
                    uid: user.uid
                });

                alert("Registration successful!");
                this.$router.push('/');
            } catch (error) {
                console.error("Error during registration: ", error);

                if (error.code === 'auth/email-already-in-use') {
                    alert("This email is already in use. Please use another email.");
                } else {
                    alert("Registration failed. Please try again.");
                }
            }
        }
    }
};
</script>


<style scoped>
.register-container {
    margin: 2rem;
    padding: 2rem;
    max-width: 100%;
    width: 100%;
    background-color: #f9f9f9;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

@media (min-width: 576px) {
    .register-container {
        margin: 3rem auto;
        padding: 3rem;
        max-width: 500px;
    }
}

@media (min-width: 768px) {
    .register-container {
        margin: 4rem auto;
        padding: 4rem;
        max-width: 550px;
    }
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
    margin-top: 1rem;
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

.password-container {
    display: flex;
    align-items: center;
    position: relative;
}

.password-container input {
    flex: 1;
    padding-right: 4rem;
}

.show-password-button {
    position: absolute;
    right: 0;
    height: 100%;
    border: none;
    background-color: transparent;
    color: #007bff;
    cursor: pointer;
    padding: 0 1rem;
    display: flex;
    align-items: center;
}

.error {
    color: red;
}

.login-link {
    margin-top: 1rem;
    text-align: center;
}

.login-link a {
    color: #007bff;
    text-decoration: none;
}

.login-link a:hover {
    text-decoration: underline;
}
</style>
