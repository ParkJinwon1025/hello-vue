<template>
    <div class="container">

        <h1 class="page-title">모니터 관리</h1>

        <div class="main-page">
            <table class="monitor-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>가격</th>
                        <th>사이즈</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="monitor in monitors" :key="monitor.id">
                        <td>{{ monitor.id }}</td>
                        <td>{{ monitor.name }}</td>
                        <td>{{ monitor.price }}</td>
                        <td>{{ monitor.size }}</td>
                        <td class="action-buttons">
                            <v-btn size="small" color="primary" variant="outlined" @click="clickUpdate(monitor)">
                                수정
                            </v-btn>
                            <v-btn size="small" color="error" variant="outlined" @click="clickDelete(monitor)">
                                삭제
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="sub-page">
            <v-btn color="success" prepend-icon="mdi-plus" @click="clickCreate">
                모니터 추가
            </v-btn>
        </div>
    </div>

    <!-- 모니터 정보 dialog -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="600">
            <v-card prepend-icon="mdi-monitor" :title="isCreateMode ? '모니터 생성' : '모니터 수정'">
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" v-if="!isCreateMode">
                            <v-text-field label="ID" v-model="id" :disabled="true"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="이름" v-model="name"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="가격" v-model="price"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="사이즈" v-model="size"></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :text="isCreateMode ? '모니터 추가' : '수정'" color="primary" variant="elevated" @click="saveMonitor">
                    </v-btn>
                    <v-btn text="취소" @click="dialog = false"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>

    <!-- 삭제 확인 dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
            <v-card-title class="text-h5">삭제 확인</v-card-title>
            <v-card-text>
                정말로 <strong>{{ monitorToDelete?.name }}</strong>을(를) 삭제하시겠습니까?
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text="삭제" color="error" variant="elevated" @click="confirmDelete"></v-btn>
                <v-btn text="취소" @click="deleteDialog = false"></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            monitors: [],
            dialog: false,
            deleteDialog: false,
            isCreateMode: true,
            id: '',
            name: '',
            price: '',
            size: '',
            currentMonitorUrl: null,
            monitorToDelete: null
        }
    },
    mounted() {
        this.fetchMonitors();
    },
    methods: {

        // 모니터 목록 조회
        fetchMonitors() {
            let url = import.meta.env.VITE_BACKEND + '/monitors';
            axios.get(url)
                .then(response => {
                    console.log("response : ", response.data);
                    this.monitors = response.data._embedded.monitors.map(monitor => {
                        return {
                            ...monitor,
                            id: monitor._links.self.href.split('/').pop()
                        };
                    });
                    console.log("monitors : ", this.monitors);
                })
                .catch(error => {
                    console.error('Error fetching monitors:', error);
                });
        },

        // 모니터 생성 버튼 클릭
        clickCreate() {
            this.isCreateMode = true;
            this.name = '';
            this.price = '';
            this.size = '';
            this.dialog = true;
        },

        // 모니터 수정 버튼 클릭
        clickUpdate(monitor) {
            console.log("monitor : ", monitor);
            let url = monitor._links.self.href;

            axios.get(url)
                .then(response => {
                    const data = response.data;
                    this.isCreateMode = false;
                    this.id = monitor.id;
                    this.name = data.name;
                    this.price = data.price;
                    this.size = data.size;
                    this.currentMonitorUrl = url;
                    this.dialog = true;
                })
                .catch(error => {
                    console.error('Error fetching monitor:', error);
                    alert('모니터를 찾을 수 없습니다.');
                    this.fetchMonitors();
                });
        },

        // 모니터 삭제 버튼 클릭
        clickDelete(monitor) {
            this.monitorToDelete = monitor;
            this.currentMonitorUrl = monitor._links.self.href;
            this.deleteDialog = true;
        },

        // 모니터 생성 또는 수정 저장
        saveMonitor() {
            if (this.isCreateMode) {
                this.createMonitor();
            } else {
                this.updateMonitor();
            }
        },

        // 모니터 생성
        createMonitor() {
            let url = import.meta.env.VITE_BACKEND + '/monitors';
            axios.post(url, {
                name: this.name,
                price: this.price,
                size: this.size
            })
                .then(response => {
                    console.log("생성 완료!");
                    this.dialog = false;
                    this.fetchMonitors();
                })
                .catch(error => {
                    console.error('Error creating monitor:', error);
                });
        },

        // 모니터 정보 수정
        updateMonitor() {
            let url = this.currentMonitorUrl;
            axios.put(url, {
                name: this.name,
                price: this.price,
                size: this.size
            })
                .then(response => {
                    console.log("수정 완료!");
                    this.dialog = false;
                    this.fetchMonitors();
                })
                .catch(error => {
                    console.error('Error updating monitor:', error);
                    if (error.response && error.response.status === 404) {
                        alert('해당 모니터를 찾을 수 없습니다.');
                    } else {
                        alert('모니터 정보 업데이트 중 오류가 발생했습니다.');
                    }
                    this.dialog = false;
                    this.fetchMonitors();
                });

        },

        // 모니터 삭제
        confirmDelete() {
            if (!this.monitorToDelete) return;

            let url = this.currentMonitorUrl;
            axios.delete(url)
                .then(response => {
                    console.log("삭제 완료!");
                    this.deleteDialog = false;
                    this.monitorToDelete = null;
                    this.fetchMonitors();
                })
                .catch(error => {
                    console.error('Error deleting monitor:', error);
                    if (error.response && error.response.status === 404) {
                        alert('해당 모니터를 찾을 수 없습니다.');
                    } else {
                        alert('모니터 삭제 중 오류가 발생했습니다.');
                    }
                    this.deleteDialog = false;
                    this.monitorToDelete = null;
                    this.fetchMonitors();
                });
        }
    }
}
</script>

<style scoped src="@/styles/monitor.css"></style>