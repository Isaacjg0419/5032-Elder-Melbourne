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

export default {
    name: 'AdminDashboardView',
    components: {
        AdminNavBar,
    },
    data() {
        return {
            users: [],
            admins: [],
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
            shouldSort: false,
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

            // Sort filtered data if shouldSort is true
            if (this.shouldSort) {
                filteredData.sort((a, b) => {
                    const prop = this.sortOrder.prop;
                    return this.sortOrder.order === 'ascending'
                        ? a[prop] > b[prop] ? 1 : -1
                        : a[prop] < b[prop] ? 1 : -1;
                });
                this.shouldSort = false;
            }

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
        handlePageChange(newPage) {
            this.currentPage = newPage;
        },
        handleSortChange({ prop, order }) {
            this.sortOrder = { prop, order };
            this.shouldSort = true;
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
            const functionUrl = this.showUserInfo
                ? 'https://updateuseroradmin-lx42yvfdtq-uc.a.run.app'
                : 'https://updateuseroradmin-lx42yvfdtq-uc.a.run.app';

            try {
                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id, ...data }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update item');
                }

                // Update local data directly
                const targetList = this.showUserInfo ? this.users : this.admins;
                const index = targetList.findIndex(user => user.id === id);
                if (index !== -1) {
                    targetList[index] = { id, ...data };
                }
                this.editingRow = null;
                this.shouldSort = true;
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        },

        async deleteItem(id) {
            const functionUrl = this.showUserInfo
                ? 'https://deleteuseroradmin-lx42yvfdtq-uc.a.run.app'
                : 'https://deleteuseroradmin-lx42yvfdtq-uc.a.run.app';

            try {
                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id }),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete item');
                }

                const targetList = this.showUserInfo ? this.users : this.admins;
                this[targetList] = targetList.filter(user => user.id !== id);
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        },
        isEditing(row) {
            return this.editingRow === row; // Check if the current row is in editing state
        },
    },
    mounted() {
        this.fetchUsers();
        this.fetchAdmins();
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
