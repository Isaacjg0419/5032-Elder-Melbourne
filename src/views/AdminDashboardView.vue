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
                <el-button :class="{ active: showUserInfo }" @click="showUsers">User Info</el-button>
                <el-button :class="{ active: !showUserInfo }" @click="showAdmins">Admin Info</el-button>
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
import { db } from '../data/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import AdminNavBar from '@/components/AdminNavBar.vue'; // Adjust the import path as needed

export default {
    name: 'AdminDashboardView',
    components: {
        AdminNavBar, // Register the AdminNavBar component
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
            editingRow: null, // 当前正在编辑的行
            shouldSort: false, // 控制是否需要排序
        };
    },
    computed: {
        filteredData() {
            const data = this.showUserInfo ? this.users : this.admins;

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

            // Sort filtered data only if shouldSort is true
            if (this.shouldSort) {
                filteredData.sort((a, b) => {
                    const prop = this.sortOrder.prop;
                    if (this.sortOrder.order === 'ascending') {
                        return a[prop] > b[prop] ? 1 : -1;
                    } else if (this.sortOrder.order === 'descending') {
                        return a[prop] < b[prop] ? 1 : -1;
                    }
                    return 0;
                });
                this.shouldSort = false; // Reset shouldSort after sorting
            }

            // Paginate data
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return filteredData.slice(start, end);
        },
        totalData() {
            return this.filteredData.length; // Use filtered data for total count
        },
    },
    methods: {
        async fetchUsers() {
            try {
                const userCollection = collection(db, 'users');
                const userSnapshot = await getDocs(userCollection);
                this.users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error("Error fetching users: ", error); // 错误处理
            }
        },
        async fetchAdmins() {
            try {
                const adminCollection = collection(db, 'admins');
                const adminSnapshot = await getDocs(adminCollection);
                this.admins = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error("Error fetching admins: ", error); // 错误处理
            }
        },
        handlePageChange(newPage) {
            this.currentPage = newPage;
        },
        handleSortChange({ prop, order }) {
            this.sortOrder = { prop, order };
            this.shouldSort = true; // Enable sorting
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
            this.editingRow = item; // 设置当前编辑行
        },
        async submitItem(item) {
            const { id, ...data } = item; // Get ID and data to update
            const collectionName = this.showUserInfo ? 'users' : 'admins'; // Determine collection name
            const userDoc = doc(db, collectionName, id); // Get document reference

            try {
                await updateDoc(userDoc, { ...data }); // Use spread operator to ensure a new object
                // Update local data directly
                const targetList = this.showUserInfo ? this.users : this.admins;
                const index = targetList.findIndex(user => user.id === id);
                if (index !== -1) {
                    targetList[index] = { id, ...data }; // Update local data
                }
                this.editingRow = null; // Clear editing row
                this.shouldSort = true; // Set shouldSort to true to enable sorting after submission
            } catch (error) {
                console.error("Error updating document: ", error); // Error handling
            }
        },
        async deleteItem(id) {
            const collectionName = this.showUserInfo ? 'users' : 'admins'; // 确定集合名称
            const userDoc = doc(db, collectionName, id); // 获取用户或管理员文档引用
            try {
                await deleteDoc(userDoc); // 删除用户或管理员
                // Remove from local data
                const targetList = this.showUserInfo ? this.users : this.admins;
                this[targetList] = targetList.filter(user => user.id !== id);
            } catch (error) {
                console.error("Error deleting document: ", error); // 错误处理
            }
        },
        isEditing(row) {
            return this.editingRow === row; // 检查当前行是否在编辑状态
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
    /* Element Plus primary color */
    color: white;
}
</style>
