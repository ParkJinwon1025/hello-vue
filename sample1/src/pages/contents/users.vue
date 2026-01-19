<template>
    <div class="container">
        <!-- 제목 추가 -->
        <h1 class="page-title">회원 관리</h1>
        
        <div class="main-page">
            <table class="user-table">
                <thead>
                    <tr>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>전화번호</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.phone }}</td>
                        <td class="action-buttons">
                            <v-btn 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                @click="clickUpdate(user)">
                                수정
                            </v-btn>
                            <v-btn 
                                size="small" 
                                color="error" 
                                variant="outlined"
                                @click="clickDelete(user)">
                                삭제
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="sub-page">
            <v-btn 
                color="success" 
                prepend-icon="mdi-plus"
                @click="clickCreate">
                회원 생성
            </v-btn>
        </div>
    </div>

    <!-- 회원 정보 수정 dialog -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="600">
            <v-card prepend-icon="mdi-account" :title="isCreateMode ? '회원 생성' : '회원 수정'">
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field label="이름" v-model="name"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="이메일" v-model="email"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="전화번호" v-model="phone"></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn 
                        :text="isCreateMode ? '생성' : '수정'" 
                        color="primary" 
                        variant="elevated"
                        @click="saveUser">
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
                정말로 <strong>{{ userToDelete?.name }}</strong> 님을 삭제하시겠습니까?
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
            users: [],
            dialog: false,
            deleteDialog: false,
            isCreateMode: true,
            name: '',
            email: '',
            phone: '',
            currentUserUrl: '',
            userToDelete: null
        }
    },
    mounted() {
        this.fetchUsers();
    },
    methods: {
        fetchUsers() {
            let url = import.meta.env.VITE_BACKEND+'/users';
            axios.get(url)
                .then(response => {
                    this.users = response.data._embedded.users;
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                });
        },
        
        clickCreate() {
            this.isCreateMode = true;
            this.name = '';
            this.email = '';
            this.phone = '';
            this.currentUserUrl = '';
            this.dialog = true;
        },
        
        clickUpdate(user) {
            this.isCreateMode = false;
            this.name = user.name;
            this.email = user.email;
            this.phone = user.phone;
            this.currentUserUrl = user._links.self.href;
            this.dialog = true;
        },
        
        clickDelete(user) {
            this.userToDelete = user;
            this.deleteDialog = true;
        },
        
        saveUser() {
            if (this.isCreateMode) {
                this.createUser();
            } else {
                this.updateUser();
            }
        },
        
        createUser() {
            let url = import.meta.env.VITE_BACKEND+'/users';
            axios.post(url, {
                name: this.name,
                email: this.email,
                phone: this.phone
            })
            .then(response => {
                console.log("생성 완료!");
                this.dialog = false;
                this.fetchUsers();
            })
            .catch(error => {
                console.error('Error creating user:', error);
            });
        },
        
        updateUser() {
            axios.put(this.currentUserUrl, {
                name: this.name,
                email: this.email,
                phone: this.phone
            })
            .then(response => {
                console.log("수정 완료!");
                this.dialog = false;
                this.fetchUsers();
            })
            .catch(error => {
                console.error('Error updating user:', error);
            });
        },
        
        confirmDelete() {
            if (!this.userToDelete) return;
            
            const deleteUrl = this.userToDelete._links.self.href;
            axios.delete(deleteUrl)
                .then(response => {
                    console.log("삭제 완료!");
                    this.deleteDialog = false;
                    this.userToDelete = null;
                    this.fetchUsers();
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                });
        }
    }
}
</script>

<style scoped src="@/styles/main.css"></style>