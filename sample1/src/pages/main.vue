<template>
    <div class="main-page">
        <table class="user-table">
            <thead>
                <tr>
                    <th>이름</th>
                    <th>수정</th>
                    <th>삭제</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>
                        <v-btn @click="clickUpdate(user)">
                            수정
                        </v-btn>
                    </td>
                    <td><v-btn @click="clickDelete(user)">
                            삭제
                        </v-btn></td>
                </tr>

            </tbody>
        </table>
    </div>
    <div class="sub-page">
        <v-btn @click="clickCreate">
            생성
        </v-btn>


    </div>



    <!-- 회원 정보 수정 dialog -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="600">


            <v-card prepend-icon="mdi-account" :title="isCreateMode ? '회원 생성' : '회원 수정'">
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" sm="10">
                            <v-text-field label="name" v-model="name"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="10">
                            <v-text-field label="Email" v-model="email"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="Phone" v-model="phone"></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>

                <!-- ⭐ 저장/취소 버튼 추가 (선택사항) -->
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :text="isCreateMode ? '생성' : '수정'" color="primary" @click="saveUser"></v-btn>
                    <v-btn text="취소" @click="dialog = false"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>

    <!-- 삭제 확인 dialog 추가-->
    <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
            <v-card-title>삭제 확인</v-card-title>
            <v-card-text>정말로 <strong></strong> 삭제하시겠습니까?</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text="취소" @click="deleteDialog = false"></v-btn>
                <v-btn text="삭제" color="error" @click="confirmDelete"></v-btn>
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
        console.log('main mounted');
        axios(
            {
                method: 'get',
                url: 'http://localhost:8080/api/users'
            }
        )
            .then(response => {
                console.log(response);
                this.users = response.data._embedded.users;
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    },
    methods: {
        fetchUsers() {
            axios(
                {
                    method: 'get',
                    url: 'http://localhost:8080/api/users'
                }
            )
                .then(response => {
                    this.users = response.data._embedded.users;
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                });
        },
        clickCreate() {
            console.log('clickCreate method called');
            this.name = '';
            this.email = '';
            this.phone = '';
            this.currentUserUrl = '';
            this.dialog = true;

        },
        clickUpdate(user1) {
            console.log('clickUpdate method called');
            if (user1) {
                this.name = user1.name;
                this.email = user1.email;
                this.phone = user1.phone;
                this.currentUserUrl = user1._links.self.href;
                this.dialog = true;
            }
        },
        clickDelete(user2) {
            console.log('clickDelete method called');
            this.userToDelete = user2;
            this.deleteDialog= true;
        },

        saveUser() {
            if (this.isCreateMode) {
                this.createUser();
            } else {
                this.updateUser();
            }
        },
        createUser() {
            axios(
                {
                    method: 'post',
                    url: 'http://localhost:8080/api/users',
                    data: {
                        name: this.name,
                        email: this.email,
                        phone: this.phone
                    }
                }
            )
                .then(response => {
                    console.log("생성 완료!");
                    this.dialog = false;
                    this.fetchUsers();
                })
        },
        updateUser() {

            const userId = this.currentUserUrl.split('/').pop();

            axios(
                {
                    method: 'put',
                    url: this.currentUserUrl,
                    data: {
                        name: this.name,
                        email: this.email,
                        phone: this.phone
                    }
                }
            )
                .then(response => {
                    console.log("수정 완료!");
                    this.dialog = false;
                    this.fetchUsers();
                }
                )
                .catch(error => {
                    console.error('Error updating user:', error);
                });
        },
        confirmDelete() {
            if (!this.userToDelete) return;

            const deleteUrl = this.userToDelete._links.self.href;
            axios(
                {
                    method: 'delete',
                    url: deleteUrl
                }
            )
                .then(response => {
                    console.log("삭제 완료!");
                    this.deleteDialog = false;
                    this.userToDelete = null;
                    this.fetchUsers();
                })
                .catch(error=> {
                    console.error('Error deleting user:', error);
                });
        }

    }
}
</script>
<style>
.main-page {
    padding: 20px;
}

.user-table {
    border-collapse: collapse;
}

.user-table,
.user-table td,
.user-table th {
    border: 1px solid #333;
    padding: 6px 10px;
}
</style>