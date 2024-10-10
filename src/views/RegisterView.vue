<template>
    <div class="register-container">
        <h2>Register</h2>
        <form @submit.prevent="handleRegister">
            <!-- First Name -->
            <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" v-model="firstName" required />
            </div>

            <!-- Last Name -->
            <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" v-model="lastName" required />
            </div>

            <!-- Age -->
            <div class="form-group">
                <label for="age">Age</label>
                <input type="number" v-model="age" required />
            </div>

            <!-- Email -->
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" v-model="email" @input="validateEmail" required />
                <p v-if="emailError" class="error">{{ emailError }}</p>
            </div>

            <!-- Password -->
            <div class="form-group">
                <label for="password">Password</label>
                <div class="password-container">
                    <input :type="showPassword ? 'text' : 'password'" v-model="password" @input="validatePassword"
                        required />
                    <span @click="togglePasswordVisibility" class="show-password-button">{{ showPassword ? 'Hide' :
            'Show' }}</span>
                </div>
                <p v-if="passwordError" class="error">{{ passwordError }}</p>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <div class="password-container">
                    <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword"
                        @input="validateConfirmPassword" required />
                    <span @click="togglePasswordVisibility" class="show-password-button">{{ showPassword ? 'Hide' :
            'Show' }}</span>
                </div>
                <p v-if="confirmPasswordError" class="error">{{ confirmPasswordError }}</p>
            </div>

            <!-- Role Selection -->
            <label for="role">Select Role</label>
            <select v-model="role" required>
                <option value="user">Regular User</option>
                <option value="admin">Administrator</option>
            </select>

            <button type="submit">Register</button>
        </form>
        <div class="login-link">
            Already have an account? <router-link to="/">Login</router-link>
        </div>
    </div>
</template>

<script>
import { db, auth } from '../data/firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import DOMPurify from 'dompurify';
import axios from 'axios'; // Import axios for sending emails

export default {
    data() {
        return {
            firstName: '',
            lastName: '',
            age: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'user',
            emailError: '',
            passwordError: '',
            confirmPasswordError: '',
            showPassword: false,
        };
    },
    methods: {
        sanitizeInput(input) {
            return DOMPurify.sanitize(input);
        },

        validateEmail() {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const sanitizedEmail = this.sanitizeInput(this.email);
            if (!regex.test(sanitizedEmail)) {
                this.emailError = 'Invalid email format.';
            } else {
                this.emailError = '';
            }
        },

        validatePassword() {
            const sanitizedPassword = this.sanitizeInput(this.password);
            const hasUppercase = /[A-Z]/;
            const hasLowercase = /[a-z]/;
            const hasDigit = /\d/;
            const hasSpecialChar = /[@$!%*?&]/;
            const illegalCharRegex = /[^a-zA-Z0-9@$!%*?&]/;

            let errorMessage = '';

            if (illegalCharRegex.test(sanitizedPassword)) {
                errorMessage = 'Password contains illegal characters.';
            } else if (!hasUppercase.test(sanitizedPassword)) {
                errorMessage = 'Password must include at least one uppercase letter.';
            } else if (!hasLowercase.test(sanitizedPassword)) {
                errorMessage = 'Password must include at least one lowercase letter.';
            } else if (!hasDigit.test(sanitizedPassword)) {
                errorMessage = 'Password must include at least one number.';
            } else if (!hasSpecialChar.test(sanitizedPassword)) {
                errorMessage = 'Password must include at least one special character.';
            } else if (sanitizedPassword.length < 8) {
                errorMessage = 'Password must be at least 8 characters long.';
            } else {
                errorMessage = '';
            }

            this.passwordError = errorMessage;
        },

        validateConfirmPassword() {
            const sanitizedPassword = this.sanitizeInput(this.password);
            const sanitizedConfirmPassword = this.sanitizeInput(this.confirmPassword);
            if (sanitizedPassword !== sanitizedConfirmPassword) {
                this.confirmPasswordError = 'Passwords do not match.';
            } else {
                this.confirmPasswordError = '';
            }
        },

        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        async sendEmail(to) {
            const data = {
                to: to,
                subject: 'Welcome to Our Service!',
                text: `Hello ${this.firstName},\n\nThank you for registering! We're glad to have you on board.\n\nBest regards,\nThe Team`
            };

            try {
                const response = await axios.post('https://sendmail-lx42yvfdtq-uc.a.run.app/sendMail', data);
                console.log('Email sent successfully:', response.data);
                return true;
            } catch (error) {
                if (error.response) {
                    console.error('Error response data: ', error.response.data);
                    console.error('Error response status: ', error.response.status);
                    console.error('Error response headers: ', error.response.headers);
                } else if (error.request) {
                    console.error('Error request: ', error.request);
                } else {
                    console.error('Error message: ', error.message);
                }
                return false;
            }
        },


        async handleRegister() {
            const sanitizedEmail = this.sanitizeInput(this.email);
            const sanitizedPassword = this.sanitizeInput(this.password);
            const sanitizedFirstName = this.sanitizeInput(this.firstName);
            const sanitizedLastName = this.sanitizeInput(this.lastName);
            const sanitizedAge = this.sanitizeInput(this.age);

            if (this.emailError || this.passwordError || this.confirmPasswordError) {
                alert('Please correct the errors before submitting.');
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
                const emailSent = await this.sendEmail(sanitizedEmail);

                if (!emailSent) {
                    throw new Error('Email failed to send, registration aborted.');
                }

                const collectionName = this.role === 'admin' ? 'admins' : 'users';

                await addDoc(collection(db, collectionName), {
                    firstName: sanitizedFirstName,
                    lastName: sanitizedLastName,
                    age: sanitizedAge,
                    email: sanitizedEmail,
                    role: this.role,
                });

                alert('Registration successful!');
                this.$router.push('/');
            } catch (error) {
                if (error.response) {
                    console.error('Error response data: ', error.response.data);
                    console.error('Error response status: ', error.response.status);
                    console.error('Error response headers: ', error.response.headers);
                } else if (error.request) {
                    console.error('Error request: ', error.request);
                } else {
                    console.error('Error message: ', error.message);
                }

                if (error.code === 'auth/email-already-in-use') {
                    alert('Email already in use, please try another.');
                } else {
                    alert('Registration failed: ' + error.message);
                }
            }
        },
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
    margin-top: -0.5rem;
    margin-bottom: 1rem;
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