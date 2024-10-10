<template>
    <div>
        <div class="sort-controls">
            <el-button @click="sortData('asc')" size="small" type="success">Sort Ascending</el-button>
            <el-button @click="sortData('desc')" size="small" type="danger">Sort Descending</el-button>
        </div>
        <Bar id="my-chart-id" :data="paginatedChartData" :options="chartOptions" />
        <div class="pagination-controls">
            <el-button @click="prevPage" :disabled="currentPage === 1" size="small" type="primary"
                icon="el-icon-arrow-left">
                Previous
            </el-button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <el-button @click="nextPage" :disabled="currentPage === totalPages" size="small" type="primary"
                icon="el-icon-arrow-right">
                Next
            </el-button>
        </div>
    </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
    name: 'BarChart',
    components: { Bar },
    props: {
        chartData: {
            type: Object,
            required: true
        },
        chartOptions: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            itemsPerPage: 5,
            currentPage: 1,
            sortedData: this.chartData.datasets[0].data.slice()
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.sortedData.length / this.itemsPerPage);
        },
        paginatedChartData() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;

            return {
                labels: this.chartData.labels.slice(start, end),
                datasets: [{
                    ...this.chartData.datasets[0],
                    data: this.sortedData.slice(start, end)
                }]
            };
        }
    },
    methods: {
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        sortData(order) {
            this.sortedData.sort((a, b) => {
                return order === 'asc' ? a - b : b - a;
            });
            this.currentPage = 1;
        }
    }
};
</script>

<style scoped>
.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
}

.pagination-controls span {
    margin: 0 10px;
}

.sort-controls {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.sort-controls el-button {
    margin: 0 5px;
}
</style>
