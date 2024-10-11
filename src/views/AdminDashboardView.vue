<template>
    <el-container>
        <AdminNavBar />
        <el-header style="margin-top: 20px;">
            <h1>Admin Dashboard</h1>
        </el-header>
        <el-main>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <el-input v-model="filters.firstName" placeholder="Search by First Name" />
                <el-input v-model="filters.lastName" placeholder="Search by Last Name" />
                <el-input v-model="filters.email" placeholder="Search by Email" />
                <el-input v-model="filters.age" placeholder="Search by Age" />
            </div>
            <div style="margin-bottom: 20px;">
                <el-button :class="{ active: showUserInfo }" @click="showUsers" type="primary">User Info</el-button>
                <el-button :class="{ active: !showUserInfo }" @click="showAdmins" type="primary">Admin Info</el-button>
            </div>
            <el-header style="margin-top: 20px;">
                <p>Total {{ showUserInfo ? userCount : adminCount }} {{ showUserInfo ? 'Users' : 'Admins' }}</p>
            </el-header>
            <el-table :data="filteredData" style="width: 100%" :default-sort="{ prop: 'firstName', order: 'ascending' }"
                @sort-change="handleSortChange">
                <el-table-column prop="firstName" label="First Name" sortable>
                    <template v-slot="scope">
                        <el-input v-model="scope.row.firstName" v-if="isEditing(scope.row)" />
                        <span v-else>{{ scope.row.firstName }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="lastName" label="Last Name" sortable>
                    <template v-slot="scope">
                        <el-input v-model="scope.row.lastName" v-if="isEditing(scope.row)" />
                        <span v-else>{{ scope.row.lastName }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="Email" sortable>
                    <template v-slot="scope">
                        <span>{{ scope.row.email }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="age" label="Age" sortable>
                    <template v-slot="scope">
                        <el-input v-model="scope.row.age" type="number" v-if="isEditing(scope.row)" />
                        <span v-else>{{ scope.row.age }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="Actions">
                    <template v-slot="scope">
                        <el-button v-if="!isEditing(scope.row)" @click="editItem(scope.row)" type="primary"
                            size="small">Edit</el-button>
                        <el-button v-else @click="submitItem(scope.row)" type="success" size="small">Submit</el-button>
                        <el-button @click="deleteItem(scope.row.id)" type="danger" size="small">Delete</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="display: flex; justify-content: center; margin-top: 20px;">
                <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize"
                    :total="totalData" layout="prev, pager, next" />
            </div>
        </el-main>
    </el-container>
</template>

<script>
import AdminNavBar from '@/components/AdminNavBar.vue';
import { db } from '../data/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default {
    name: 'AdminDashboardView',
    components: {
        AdminNavBar,
    },
    data() {
        return {
            users: [],
            admins: [],
            userCount: 0,
            adminCount: 0,
            showUserInfo: true,
            filters: {
                firstName: '',
                lastName: '',
                email: '',
                age: '',
            },
            currentPage: 1,
            pageSize: 10,
            sortOrder: {
                prop: 'firstName',
                order: 'ascending',
            },
            editingRow: null,
        };
    },
    computed: {
        filteredData() {
            const data = this.showUserInfo ? this.users : this.admins;

            // Filter data based on search criteria
            const filteredData = data.filter(item => {
                const firstName = item.firstName?.toLowerCase() || '';
                const lastName = item.lastName?.toLowerCase() || '';
                const email = item.email?.toLowerCase() || '';
                const age = item.age?.toString() || '';

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
                return this.sortOrder.order === 'ascending'
                    ? a[prop] > b[prop] ? 1 : -1
                    : a[prop] < b[prop] ? 1 : -1;
            });

            // Paginate data
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return filteredData.slice(start, end);
        },
        totalData() {
            return this.filteredData.length;
        },
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await fetch('https://getusers-lx42yvfdtq-uc.a.run.app');
                const data = await response.json();
                this.users = data;
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        },
        async fetchAdmins() {
            try {
                const response = await fetch('https://getadmins-lx42yvfdtq-uc.a.run.app');
                const data = await response.json();
                this.admins = data;
            } catch (error) {
                console.error("Error fetching admins: ", error);
            }
        },
        async fetchCounts() {
            try {
                const response = await fetch('https://getuserandadmincounts-lx42yvfdtq-uc.a.run.app');
                const { userCount, adminCount } = await response.json();
                this.userCount = userCount;
                this.adminCount = adminCount;
                console.log(this.userCount, this.adminCount);
            } catch (error) {
                console.error("Error fetching counts: ", error);
            }
        },
        handlePageChange(newPage) {
            this.currentPage = newPage;
        },
        handleSortChange({ prop, order }) {
            if (!this.editingRow) { // Only allow sorting if not editing
                this.sortOrder = { prop, order };
            }
        },
        showUsers() {
            this.showUserInfo = true;
            this.currentPage = 1;
        },
        showAdmins() {
            this.showUserInfo = false;
            this.currentPage = 1;
        },
        editItem(item) {
            this.editingRow = item;
        },
        async submitItem(item) {
            const { id, ...data } = item;
            const collectionName = this.showUserInfo ? 'users' : 'admins';
            const userDoc = doc(db, collectionName, id);

            try {
                await updateDoc(userDoc, { ...data });
                const targetList = this.showUserInfo ? this.users : this.admins;
                const index = targetList.findIndex(user => user.id === id);
                if (index !== -1) {
                    targetList[index] = { id, ...data };
                }
                this.editingRow = null; // Reset editingRow after submission
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        },
        async deleteItem(id) {
            const collectionName = this.showUserInfo ? 'users' : 'admins';
            const userDoc = doc(db, collectionName, id);
            try {
                await deleteDoc(userDoc);
                const targetList = this.showUserInfo ? this.users : this.admins;

                const updatedList = targetList.filter(user => user.id !== id);

                if (this.showUserInfo) {
                    this.users = updatedList;
                } else {
                    this.admins = updatedList;
                }
                console.log("Updated List:", updatedList);
                await this.fetchCounts();
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        },
        isEditing(row) {
            return this.editingRow === row;
        },
    },

    mounted() {
        this.fetchUsers();
        this.fetchAdmins();
        this.fetchCounts();
    },
};
</script>

<style scoped>
.dialog-footer {
    display: flex;
    justify-content: flex-end;
}

.active {
    background-color: #409EFF;
    color: white;
}
</style>
