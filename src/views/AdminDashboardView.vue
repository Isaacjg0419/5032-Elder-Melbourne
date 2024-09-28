<template>
    <el-container>
        <el-header>
            <h1>Admin Dashboard</h1>
        </el-header>
        <el-main>
            <el-input v-model="searchQuery" placeholder="Search by name or email" style="margin-bottom: 20px;" />
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
            users: [],
            searchQuery: '',
            currentPage: 1,
            pageSize: 10,
        };
    },
    computed: {
        filteredUsers() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;

            return this.users
                .filter(user => {
                    const firstName = user.firstName || '';
                    const lastName = user.lastName || '';
                    const email = user.email || '';
                    return firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                        lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                        email.toLowerCase().includes(this.searchQuery.toLowerCase());
                })
                .slice(start, end);
        },
        totalUsers() {
            return this.users.filter(user => {
                const firstName = user.firstName || '';
                const lastName = user.lastName || '';
                const email = user.email || '';
                return firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    email.toLowerCase().includes(this.searchQuery.toLowerCase());
            }).length;
        },
    },
    methods: {
        async fetchUsers() {
            const userCollection = collection(db, 'users');
            const userSnapshot = await getDocs(userCollection);
            this.users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(this.users);
        },
        handlePageChange(newPage) {
            this.currentPage = newPage;
        },
        handleSortChange({ prop, order }) {
            if (order === 'ascending') {
                this.users.sort((a, b) => (a[prop] > b[prop] ? 1 : -1));
            } else if (order === 'descending') {
                this.users.sort((a, b) => (a[prop] < b[prop] ? 1 : -1));
            }
        },
    },
    mounted() {
        this.fetchUsers();
    },
};
</script>

<style scoped></style>