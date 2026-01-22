<template>
    <div class="container">
        <h1 class="page-title">{{ config.title }}</h1>

        <div class="main-page">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th v-for="field in fields" :key="field.key">
                            {{ field.label }}
                        </th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in items" :key="item.id">
                        <td>{{ item.id }}</td>
                        <td v-for="field in fields" :key="field.key">
                            {{ item[field.key] }}
                        </td>
                        <td class="action-buttons">
                            <v-btn size="small" color="primary" variant="outlined" @click="clickUpdate(item)">
                                수정
                            </v-btn>
                            <v-btn size="small" color="error" variant="outlined" @click="clickDelete(item)">
                                삭제
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="sub-page">
            <v-btn color="success" prepend-icon="mdi-plus" @click="clickCreate">
                {{ config.addButtonText }}
            </v-btn>
        </div>

        <!-- 생성/수정 dialog -->
        <v-dialog v-model="dialog" max-width="600">
            <v-card :prepend-icon="config.icon" :title="isCreateMode ? config.createTitle : config.updateTitle">
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" v-if="!isCreateMode">
                            <v-text-field label="ID" v-model="formData.id" :disabled="true"></v-text-field>
                        </v-col>
                        <v-col cols="12" v-for="field in fields" :key="field.key">
                            <v-text-field :label="field.label" v-model="formData[field.key]">
                            </v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :text="isCreateMode ? '추가' : '수정'" color="primary" variant="elevated"
                        @click="saveItem"></v-btn>
                    <v-btn text="취소" @click="dialog = false"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h5">삭제 확인</v-card-title>
                <v-card-text>
                    정말로 <strong>{{ itemToDelete?.[config.displayField] }}</strong>을(를) 삭제하시겠습니까?
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
import { labelMap } from '@/utils/labelMap';
import { entityConfigs } from '@/utils/entityConfigs';

export default {

    // 부모 컴포넌트에서 받는 값
    props: {
        item: {
            type: String,
            required: true
        }
    },
    data() {
        console.log("data 함수");
        return {
            items: [],
            dialog: false,
            deleteDialog: false,
            isCreateMode: true,
            formData: {},  // 폼 입력 데이터
            currentItemUrl: null,
            itemToDelete: null
        }
    },
    // 다른 데이터를 가공해서 새 값을 만들 때 사용
    // computed 함수 안에 정의하면 Vue가 자동으로 this.로 접근할 수 있음.
    computed: {
        config() {
            console.log("computed/config 함수");
            return entityConfigs[this.item];
        },
        fields() {
            console.log("computed/fields 함수");
            return this.config.fieldKeys.map(key => ({
                key: key,
                label: labelMap[key] || key
            }));
        }
    },
    mounted() {
        console.log("mounted 함수");
        this.initFormData();
        this.fetchItems();
    },
    methods: {
        initFormData() {
            this.formData = { id: '' };
            this.config.fieldKeys.forEach(key => {
                this.formData[key] = '';
            });
        },

        fetchItems() {
            let url = import.meta.env.VITE_BACKEND + this.config.endpoint;
            console.log(url);
            axios.get(url)
                .then(response => {
                    this.items = response.data._embedded[this.config.embeddedKey].map(item => ({
                        ...item,
                        id: item._links.self.href.split('/').pop()
                    }));
                    console.log(this.items);
                })
                .catch(error => {
                    console.error('Error fetching items:', error);
                });
        },

        clickCreate() {
            this.isCreateMode = true;
            this.initFormData();
            this.dialog = true;
        },

        clickUpdate(item) {
            let url = item._links.self.href;
            axios.get(url)
                .then(response => {
                    const data = response.data
                    this.isCreateMode = false;
                    this.formData.id = item.id;
                    this.config.fieldKeys.forEach(key => {
                        this.formData[key] = data[key]
                    });
                    this.currentItemUrl = url;
                    this.dialog = true;
                })
                .catch(error => {
                    console.error('Error fetching item: ', error);
                    alert('데이터를 찾을 수 없습니다.');
                    this.fetchItems();
                });
        },

        clickDelete(item) {
            this.itemToDelete=item;
            this.currentItemUrl = item._links.self.href;
            this.deleteDialog = true;
        },

        saveItem() {
            if (this.isCreateMode) {
                this.createItem();
            } else {
                this.updateItem();
            }
        },

        createItem() {
            let url = import.meta.env.VITE_BACKEND + this.config.endpoint;
            let payload = {};
            this.config.fieldKeys.forEach(key => {
                payload[key] = this.formData[key];
            });

            axios.post(url, payload)
                .then(reponse => {
                    this.dialog = false;
                    this.fetchItems();
                })
                .catch(error => {
                    console.error('Error creating item:', error);
                });
        },

        updateItem() {
            let payload = {};
            this.config.fieldKeys.forEach(key => {
                payload[key] = this.formData[key];
            });

            axios.put(this.currentItemUrl, payload)
                .then(response => {
                    this.dialog = false;
                    this.fetchItems();
                })
                .catch(error => {
                    console.error('Error updating item:', error);
                    alert('데이터를 수정할 수 없습니다.');
                    this.dialog = false;
                    this.fetchItems();
                });
        },

        confirmDelete() {
            if (!this.itemToDelete) return;

            axios.delete(this.currentItemUrl)
                .then(() => {
                    this.deleteDialog = false;
                    this.itemToDelete = null;
                    this.fetchItems();
                })
                .catch(error => {
                    console.error('Error deleting item:', error);
                    alert('데이터를 삭제할 수 없습니다.');
                    this.deleteDialog = false;
                    this.itemToDelete = null;
                    this.fetchItems();
                });
        }

    }
}

</script>

<style scoped src="@/styles/crud.css"></style>