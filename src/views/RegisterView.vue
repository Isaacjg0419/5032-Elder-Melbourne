<template>
    <div class="register-container">
        <h2>Register</h2>
        <form @submit.prevent="handleRegister">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" v-model="email" required />
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
                <label for="confirmPassword">Confirm Password</label>
                <div class="password-container">
                    <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword" required />
                    <span @click="togglePasswordVisibility" class="show-password-button">
                        {{ showPassword ? 'Hide' : 'Show' }}
                    </span>
                </div>
                <p v-if="confirmPasswordError" class="error">{{ confirmPasswordError }}</p>
            </div>

            <div class="form-group">
                <label for="role">Select Role</label>
                <select v-model="role" required>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <button type="submit">Register</button>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            email: "",
            password: "",
            confirmPassword: "",
            role: "user",
            passwordError: "",
            confirmPasswordError: "",
            showPassword: false,
        };
    },
    watch: {
        password(newPassword) {
            if (!this.validatePassword(newPassword)) {
                this.passwordError = "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.";
            } else {
                this.passwordError = "";
            }
            this.validateConfirmPassword();
        },
        confirmPassword(newConfirmPassword) {
            this.validateConfirmPassword();
        },
    },
    methods: {
        validatePassword(password) {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return regex.test(password);
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
        // TODO integrate firebase for CRUD user data 
        async handleRegister() {
            if (!this.validatePassword(this.password)) {
                this.passwordError = "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.";
                return;
            }

            if (this.password !== this.confirmPassword) {
                this.confirmPasswordError = "Passwords do not match.";
                return;
            }
            // refresh all the previous errors
            this.passwordError = ""; 
            this.confirmPasswordError = ""; 

            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password,
                    role: this.role,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Registration successful!");
                this.$router.push('/login');
            } else {
                alert(result.message || "Registration failed.");
            }
        },
    },
};
</script>

<style scoped>
.register-container {
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
