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
                <div class="password-container">
                    <input :type="showPassword ? 'text' : 'password'" v-model="password" required />
                    <span @click="togglePasswordVisibility" class="show-password-button">
                        {{ showPassword ? 'Hide' : 'Show' }}
                    </span>
                </div>
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
// Import Firebase functions
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import accounts from '../data/accounts.json';

export default {
    data() {
        return {
            email: "",
            password: "",
            role: "user", // Default role
            submitted: false,
            showPassword: false, // Added for showing/hiding password
        };
    },
    methods: {
        async handleLogin() {
            this.submitted = true;
            try {
                // Firebase Authentication sign-in
                const auth = getAuth();
                const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);

                // Check role in Firestore
                const db = getFirestore();
                const roleQuery = query(
                    collection(db, this.role === 'admin' ? 'admins' : 'users'),
                    where('email', '==', this.email)
                );

                const querySnapshot = await getDocs(roleQuery);

                if (!querySnapshot.empty) {
                    // Successful login
                    alert("Login successful!");

                    // Navigate based on role
                    if (this.role === "admin") {
                        this.$router.push('/admin-dashboard');
                    } else {
                        this.$router.push('/user-home');
                    }
                } else {
                    alert("Role mismatch or account not found in the specified collection.");
                }
            } catch (error) {
                alert("Login failed: " + error.message);
            }
        },

        async uploadAccountsToFirebase() {
            const db = getFirestore();

            try {
                // Write accounts to Firebase (admins and users)
                accounts.accounts.forEach(async account => {
                    const collectionName = account.role === 'admin' ? 'admins' : 'users';
                    await addDoc(collection(db, collectionName), {
                        email: account.email,
                        password: account.password,
                        role: account.role
                    });
                });
                alert("Accounts successfully uploaded to Firebase!");
            } catch (error) {
                console.error("Error uploading accounts: ", error);
            }
        },

        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        }
    },

    // mounted (Lifecycle hook) to initialize Firebase accounts
    async mounted() {
        // Uncomment to upload accounts to Firebase only once
        // await this.uploadAccountsToFirebase();
    },
};
</script>

<style scoped>
.login-container {
    margin: 5rem;
    padding: 5rem;
    background-color: #f9f9f9;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1rem;
}

.register-link {
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
</style>
