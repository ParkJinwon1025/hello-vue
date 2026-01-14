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
                    <td><v-btn @click="clickDelete">
                            삭제
                        </v-btn></td>
                </tr>

            </tbody>
        </table>
    </div>



    <!-- 회원 정보 수정 dialog -->
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="600">
           

            <v-card prepend-icon="mdi-account" title="User Profile">
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
                    <v-btn text="저장" color="primary" @click="saveUser"></v-btn>
                    <v-btn text="취소" @click="dialog = false"></v-btn>
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
            users: [],
            dialog: false,
            name: '',
            email: '',
            phone: '',
            currentUserUrl: ''
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
        clickDelete() {
            console.log('clickDelete method called');
        },
        saveUser(){

            const userId = this.currentUserUrl.split('/').pop();

            axios(
                {
                    method:'put',
                    url:this.currentUserUrl,
                    data:{
                        name:this.name,
                        email:this.email,
                        phone:this.phone
                    }
                }
            )
            .then(response =>{
                console.log("수정 완료!");
                this.dialog = false;
                return axios(
                    {
                        method: 'get',
                        url: 'http://localhost:8080/api/users'
                    }
                );
            }
            )
            .then(response => {
                this.users = response.data._embedded.users;
                console.log(this.users);
            })
            .catch(error =>{
                console.error('Error updating user:', error);
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
.user-table td, .user-table th {
    border: 1px solid #333;
    padding: 6px 10px;
}

</style>