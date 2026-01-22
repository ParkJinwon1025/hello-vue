<template>
    <GenericCrudView item="monitor" />
</template>

<script>
import GenericCrudView from '@/components/GenericView.vue';


// 컴포넌트 등록(안하면 template에서 사용하지 못함.)
export default {
    components: { GenericCrudView }
}
</script>