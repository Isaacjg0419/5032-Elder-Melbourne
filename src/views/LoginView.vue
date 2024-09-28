<template>
    <div class="login-container">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" v-model="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    title="Please enter a valid email address." />
                <p v-if="emailError" class="error">{{ emailError }}</p>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <div class="password-container">
                    <input :type="showPassword ? 'text' : 'password'" v-model="password" required />

                    <span @click="togglePasswordVisibility" class="show-password-button">
                        {{ showPassword ? 'Hide' : 'Show' }}
                    </span>
                </div>
                <p v-if="passwordError" class="error">{{ passwordError }}</p>
            </div>

            <div class="form-group">
                <label for="role">Select Role</label>
                <select v-model="role" required>
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                </select>
            </div>

            <button type="submit">Login</button>
        </form>

        <div class="register-link">
            <p>Don't have an account? <a href="/register">Register a new one</a></p>
        </div>
    </div>
    <!-- TODO,dashboard page for login as admin -->
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import DOMPurify from 'dompurify';

export default {
    data() {
        return {
            email: "",
            password: "",
            role: "user",
            showPassword: false,
            emailError: "",
            passwordError: "",
        };
    },
    methods: {
        // sanitize input to prevent XSS attacks with DOMPurify
        sanitizeInput(input) {
            return DOMPurify.sanitize(input);
        },

        // Validate email format with illegal characters
        // identified illegal characters:re("[^\s@]+@[^\s@]+\.[^\s@]")
        validateEmail() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const sanitizedEmail = this.sanitizeInput(this.email);
            if (!emailPattern.test(sanitizedEmail)) {
                this.emailError = "Invalid email format.";
            } else {
                this.emailError = "";
            }
        },

        // Validate password
        validatePassword() {
            const sanitizedPassword = this.sanitizeInput(this.password);
            // show different error msgs based on the missing requirements
            const hasUppercase = /[A-Z]/;
            const hasLowercase = /[a-z]/;
            const hasDigit = /\d/;
            const hasSpecialChar = /[@$!%*?&]/;
            const illegalCharRegex = /[^a-zA-Z0-9@$!%*?&]/;

            let errorMessage = "";

            if (illegalCharRegex.test(sanitizedPassword)) {
                errorMessage = "Password contains illegal characters.";
            } else {
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

        // Handle login
        async handleLogin() {
            this.email = this.sanitizeInput(this.email);
            this.password = this.sanitizeInput(this.password);

            this.validateEmail();
            this.validatePassword();

            if (this.emailError || this.passwordError) {
                alert("Please correct the errors before submitting.");
                return;
            }

            try {
                const auth = getAuth();
                const db = getFirestore();
                const roleQuery = query(
                    collection(db, this.role === 'admin' ? 'admins' : 'users'),
                    where('email', '==', this.email)
                );

                const querySnapshot = await getDocs(roleQuery);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();

                    const userName = userData.firstName || "Unknown User";

                    const userInfo = {
                        email: this.email,
                        role: this.role,
                        name: userName
                    };
                    localStorage.setItem('user', JSON.stringify(userInfo));

                    alert("Login successful!");


                    if (this.role === "admin") {
                        this.$router.push('/admin-dashboard');
                    } else {
                        this.$router.push('/user-home');
                    }
                } else {
                    alert("Role mismatch or account not found.");
                }
            } catch (error) {
                alert("Login failed: " + error.message);
            }
        },

        // switch password visualization
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        }
    }
};
</script>

<style scoped>
.login-container {
    margin: 2rem;
    padding: 2rem;
    max-width: 100%;
    width: 100%;
    background-color: #f9f9f9;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

@media (min-width: 576px) {
    .login-container {
        margin: 3rem auto;
        padding: 3rem;
        max-width: 500px;
    }
}

@media (min-width: 768px) {
    .login-container {
        margin: 4rem auto;
        padding: 4rem;
        max-width: 600px;
    }
}

.form-group {
    margin-bottom: 1rem;
}

.register-link {
    text-align: center;
    margin-top: 1rem;
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
</style>
