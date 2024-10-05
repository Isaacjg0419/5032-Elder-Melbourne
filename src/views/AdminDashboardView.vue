<template>
    <el-container>
        <el-header>
            <h1>Admin Dashboard</h1>
        </el-header>
        <el-main>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <el-input v-model="filters.firstName" placeholder="Search by First Name" />
                <el-input v-model="filters.lastName" placeholder="Search by Last Name" />
                <el-input v-model="filters.email" placeholder="Search by Email" />
                <el-input v-model="filters.age" placeholder="Search by Age" />
            </div>

            <el-table :data="filteredUsers" style="width: 100%"
                :default-sort="{ prop: 'firstName', order: 'ascending' }" @sort-change="handleSortChange">
                <el-table-column prop="firstName" label="First Name" sortable />
                <el-table-column prop="lastName" label="Last Name" sortable />
                <el-table-column prop="email" label="Email" sortable />
                <el-table-column prop="age" label="Age" sortable />
            </el-table>

            <div style="display: flex; justify-content: center; margin-top: 20px;">
                <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize"
                    :total="totalUsers" layout="prev, pager, next" />
            </div>
        </el-main>
    </el-container>
</template>

<script>
import { db } from '../data/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default {
    name: 'AdminDashboardView',
    data() {
        return {
            users: [], // Store user data
            filters: {
                firstName: '',
                lastName: '',
                email: '',
                age: '',
            },
            currentPage: 1, // Current page for pagination
            pageSize: 10, // Number of rows per page
            sortOrder: {
                prop: 'firstName', // Default sort property
                order: 'ascending', // Default sort order
            },
        };
    },
    computed: {
        filteredUsers() {
            // Filter users based on search inputs
            const filteredData = this.users.filter(user => {
                const firstName = user.firstName?.toLowerCase() || ''; // Use optional chaining
                const lastName = user.lastName?.toLowerCase() || '';
                const email = user.email?.toLowerCase() || '';
                const age = user.age?.toString() || '';

                return (
                    firstName.includes(this.filters.firstName.toLowerCase()) &&
                    lastName.includes(this.filters.lastName.toLowerCase()) &&
                    email.includes(this.filters.email.toLowerCase()) &&
                    age.includes(this.filters.age.toLowerCase())
                );
            });

            // Sort filtered data
            filteredData.sort((a, b) => {
                const prop = this.sortOrder.prop;
                if (this.sortOrder.order === 'ascending') {
                    return a[prop] > b[prop] ? 1 : -1;
                } else if (this.sortOrder.order === 'descending') {
                    return a[prop] < b[prop] ? 1 : -1;
                }
                return 0;
            });

            // Paginate data
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return filteredData.slice(start, end);
        },
        totalUsers() {
            // Calculate total number of users after filtering
            return this.users.filter(user => {
                const firstName = user.firstName?.toLowerCase() || '';
                const lastName = user.lastName?.toLowerCase() || '';
                const email = user.email?.toLowerCase() || '';
                const age = user.age?.toString() || '';

                return (
                    firstName.includes(this.filters.firstName.toLowerCase()) &&
                    lastName.includes(this.filters.lastName.toLowerCase()) &&
                    email.includes(this.filters.email.toLowerCase()) &&
                    age.includes(this.filters.age.toLowerCase())
                );
            }).length;
        },
    },
    methods: {
        async fetchUsers() {
            const userCollection = collection(db, 'users');
            const userSnapshot = await getDocs(userCollection);
            // Map fetched data to the users array
            this.users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(this.users); // Log the users to verify data structure
        },
        // Update the current page on pagination change
        handlePageChange(newPage) {
            this.currentPage = newPage;
        },
        // Update sort order based on user interaction
        handleSortChange({ prop, order }) {
            this.sortOrder = { prop, order };
        },
    },
    mounted() {
        this.fetchUsers(); // Fetch users when component is mounted
    },
};
</script>

<style scoped>
/* Add any scoped styles here */
</style>
