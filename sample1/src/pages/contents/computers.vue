<template>
    <div class="container">
        <h1 class="page-title">컴퓨터 관리</h1>
        
        <div class="main-page">
            <table class="computer-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>이름</th>
                        <th>타입</th>
                        <th>가격</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="computer in computers" :key="computer.id">
                        <td>{{ computer.id }}</td>
                        <td>{{ computer.name }}</td>
                        <td>{{ computer.type }}</td>
                        <td>{{ computer.price }}</td>
                        <td class="action-buttons">
                            <v-btn size="small" color="primary" variant="outlined" @click="clickUpdate(computer)">
                                수정
                            </v-btn>
                            <v-btn size="small" color="error" variant="outlined" @click="clickDelete(computer)">
                                삭제
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="sub-page">
            <v-btn color="success" prepend-icon="mdi-plus" @click="clickCreate">
                컴퓨터 추가
            </v-btn>
        </div>
    </div>

    <!-- 컴퓨터 정보 dialog -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="600">
            <v-card prepend-icon="mdi-desktop-tower" :title="isCreateMode ? '컴퓨터 생성' : '컴퓨터 수정'">
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" v-if="!isCreateMode">
                            <v-text-field label="ID" v-model="id" :disabled="true"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="이름" v-model="name"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="타입" v-model="type"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="가격" v-model="price"></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :text="isCreateMode ? '추가' : '수정'" color="primary" variant="elevated" @click="saveComputer"></v-btn>
                    <v-btn text="취소" @click="dialog = false"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 삭제 확인 dialog -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h5">삭제 확인</v-card-title>
                <v-card-text>
                    정말로 <strong>{{ computerToDelete?.name }}</strong>을 삭제하시겠습니까?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="삭제" color="error" variant="elevated" @click="confirmDelete"></v-btn>
                    <v-btn text="취소" @click="deleteDialog = false"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            computers: [],
            dialog: false,
            deleteDialog: false,
            isCreateMode: true,
            id: '',
            name: '',
            type: '',
            price: '',
            currentComputerUrl: null,
            computerToDelete: null
        }
    },
    mounted() {
        this.fetchComputers();
    },
    methods: {
        // 컴퓨터 목록 조회
        fetchComputers() {
            let url = import.meta.env.VITE_BACKEND + '/computers';
            axios.get(url)
                .then(response => {
                    console.log(response.data);
                    this.computers = response.data._embedded.computers.map(computer => {
                        return {
                            ...computer,
                            id: computer._links.self.href.split('/').pop()
                        };
                    });
                    console.log("computers : ", this.computers);
                })
                .catch(error => {
                    console.error('Error fetching computers:', error);
                });
        },

        // 컴퓨터 추가 버튼
        clickCreate() {
            this.isCreateMode = true;
            this.name = '';
            this.type = '';
            this.price = '';
            this.dialog = true;
        },

        // 컴퓨터 수정 버튼
        clickUpdate(computer) {
            console.log(computer);
            let url = computer._links.self.href;

            axios.get(url)
                .then(response => {
                    console.log("response : ", response);
                    const data = response.data;
                    this.isCreateMode = false;
                    this.id = computer.id;
                    this.name = data.name;
                    this.price = data.price;
                    this.type = data.type;
                    this.currentComputerUrl = url;
                    this.dialog = true;
                })
                .catch(error => {
                    console.error('Error fetching computer:', error);
                    alert('컴퓨터를 찾을 수 없습니다.');
                    this.fetchComputers();
                });
        },

        // 컴퓨터 삭제 버튼
        clickDelete(computer) {
            this.computerToDelete = computer;
            this.currentComputerUrl = computer._links.self.href;
            this.deleteDialog = true;
        },

        // 컴퓨터 생성 또는 수정 저장
        saveComputer() {
            if (this.isCreateMode) {
                this.createComputer();
            } else {
                this.updateComputer();
            }
        },

        // 컴퓨터 생성
        createComputer() {
            let url = import.meta.env.VITE_BACKEND + '/computers';
            axios.post(url, {
                name: this.name,
                type: this.type,
                price: this.price
            })
            .then(response => {
                console.log("생성 완료!");
                this.dialog = false;
                this.fetchComputers();
            })
            .catch(error => {
                console.error('Error creating computer: ', error);
            });
        },

        // 컴퓨터 정보 수정
        updateComputer() {
            let url = this.currentComputerUrl;
            axios.put(url, {
                name: this.name,
                type: this.type,
                price: this.price
            })
            .then(response => {
                console.log("수정 완료!");
                this.dialog = false;
                this.fetchComputers();
            })
            .catch(error => {
                console.log('Error updating computer: ', error);
                if (error.response && error.response.status === 404) {
                    alert('해당 컴퓨터를 찾을 수 없습니다.');
                } else {
                    alert('컴퓨터 정보 업데이트 중 오류가 발생했습니다.');
                }
                this.dialog = false;
                this.fetchComputers();
            });
        },

        // 컴퓨터 삭제
        confirmDelete() {
            if (!this.computerToDelete) return;

            let url = this.currentComputerUrl;

            axios.delete(url)
                .then(response => {
                    console.log("삭제 완료!");
                    this.deleteDialog = false;
                    this.computerToDelete = null;
                    this.fetchComputers();
                })
                .catch(error => {
                    console.error('Error deleting computer: ', error);
                    if (error.response && error.response.status === 404) {
                        alert('해당 컴퓨터를 찾을 수 없습니다.');
                    } else {
                        alert('컴퓨터 삭제 중 오류가 발생했습니다.');
                    }
                    this.deleteDialog = false;
                    this.computerToDelete = null;
                    this.fetchComputers();
                });
        }
    }
}
</script>

<style scoped src="@/styles/computer.css"></style>