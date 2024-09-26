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
                <label for="confirmPassword">Confirm Password</label>
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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import DOMPurify from 'dompurify';
import axios from 'axios';

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
        // Sanitize input to remove potential XSS attacks,use DOMPurify
        sanitizeInput(input) {
            return DOMPurify.sanitize(input);
        },

        // Validate email format,regex for illegal special characters
        validateEmail() {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const sanitizedEmail = this.sanitizeInput(this.email);
            if (!regex.test(sanitizedEmail)) {
                this.emailError = "Invalid email format.";
            } else {
                this.emailError = "";
            }
        },

        validatePassword() {
            const sanitizedPassword = this.sanitizeInput(this.password);

            // Regex to check for required password format
            const hasUppercase = /[A-Z]/;
            const hasLowercase = /[a-z]/;
            const hasDigit = /\d/;
            const hasSpecialChar = /[@$!%*?&]/;
            // detect illegal characters 
            const illegalCharRegex = /[^a-zA-Z0-9@$!%*?&]/;

            let errorMessage = "";

            if (illegalCharRegex.test(sanitizedPassword)) {
                errorMessage = "Password contains illegal characters.";
            } else {
                // check different validation requirements with different mentions msgs
                if (!hasUppercase.test(sanitizedPassword)) {
                    errorMessage = "Password must include at least one uppercase letter.";
                } else if (!hasLowercase.test(sanitizedPassword)) {
                    errorMessage = "Password must include at least one lowercase letter.";
                } else if (!hasDigit.test(sanitizedPassword)) {
                    errorMessage = "Password must include at least one number.";
                } else if (!hasSpecialChar.test(sanitizedPassword)) {
                    errorMessage = "Password must include at least one special character.";
                } else if (sanitizedPassword.length < 8) {
                    errorMessage = "Password must be at least 8 characters long.";
                } else {
                    errorMessage = "";
                }
            }

            this.passwordError = errorMessage;
        },

        // Validate if the confirmed password does not match the password
        validateConfirmPassword() {
            const sanitizedPassword = this.sanitizeInput(this.password);
            const sanitizedConfirmPassword = this.sanitizeInput(this.confirmPassword);
            if (sanitizedPassword !== sanitizedConfirmPassword) {
                this.confirmPasswordError = "Passwords do not match.";
            } else {
                this.confirmPasswordError = "";
            }
        },

        // switch password visibility
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },

        async fileToBase64(url) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error("Error converting file to base64:", error);
                throw error;
            }
        },

        async handleRegister() {
            const sanitizedEmail = this.sanitizeInput(this.email);
            const sanitizedPassword = this.sanitizeInput(this.password);
            const sanitizedConfirmPassword = this.sanitizeInput(this.confirmPassword);

            if (this.emailError || this.passwordError || this.confirmPasswordError) {
                alert("Please correct the errors before submitting.");
                return;
            }

            try {
                console.log("Registering user with email:", sanitizedEmail);

                // Register the user
                const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
                console.log("User registered successfully:", userCredential);

                // Determine the collection based on role
                const collectionName = this.role === "admin" ? "admins" : "users";
                await addDoc(collection(db, collectionName), {
                    email: sanitizedEmail,
                    password: sanitizedPassword,
                    role: this.role
                });
                console.log(`User added to ${collectionName} collection`);

                // Get the base64 content of the PDF from the public directory
                const pdfUrl = '/attachments/welcome_user_utf8.pdf';
                try {
                    await sendWelcomeEmail(sanitizedEmail, pdfUrl);
                    alert('Registration successful and email sent!');
                } catch (emailError) {
                    alert('Registration successful, but failed to send welcome email.');
                }

                this.$router.push('/');
            } catch (error) {
                console.error("Error during registration: ", error);

                if (error.code === 'auth/email-already-in-use') {
                    alert("This email is already in use. Please use another email.");
                } else if (error.code === 'auth/weak-password') {
                    alert("The password is too weak. Please choose a stronger password.");
                } else {
                    alert("Registration failed. Please try again.");
                }
            }
        },
        async sendWelcomeEmail(to, pdfUrl) {
            try {
                let pdfBase64;
                try {
                    pdfBase64 = await fileToBase64(pdfUrl);
                    console.log("PDF converted to base64 successfully");
                } catch (fileError) {
                    console.error("Error converting PDF to base64:", fileError);
                    throw new Error("Failed to load welcome document");
                }

                const response = await axios.post('/sendEmail', {
                    subject: 'Welcome to Elder Melbourne',
                    text: `Hello ${to},\n\nWelcome to Elder Melbourne Community! We are glad to have you on board.\n\nBest regards,\nTeam`,
                    html: `
                <h1>Welcome to Elder Melbourne</h1>
                <p>Hello ${to},</p>
                <p>Welcome to <strong>Elder Melbourne Community</strong>! We are glad to have you on board.</p>
                <p>Best regards,<br>Team</p>
            `,
                    // attachmentContent: pdfBase64,
                    // attachmentFileName: 'welcome_user_utf8.pdf'
                });
                console.log("Email sent successfully:", response.data);
                return response.data;
            } catch (error) {
                console.error('Error sending email:', error);
                throw new Error("Failed to send welcome email");
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