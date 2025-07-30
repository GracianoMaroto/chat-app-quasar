<template>
    <q-page-sticky position="top" expand class="tabs-zindex">
        <q-tabs
        v-model="uidSelecionado"
        inline-label
        outside-arrows
        mobile-arrows
        class="bg-primary text-white shadow-2 full-width"
        >
        <q-tab 
        v-for="user in arraySemUser" :key="user.uid"
        :name="user.uid" icon="account_circle" :label="user.email"
        :class="user.estado ? 'text-white' : 'text-grey'"
        />
      </q-tabs>
    </q-page-sticky>


</template>

<script setup>
import { ref , computed , inject} from 'vue';
import { onSnapshot , collection , query} from "firebase/firestore";
import { auth, db } from 'src/boot/firebase';
import { useAuth } from '@vueuse/firebase';

const {user} = useAuth(auth)

const q = query(collection(db, "usuarios"));
const unsubscribe = onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
        console.log("Usuário novo: ", change.doc.data());
        users.value = [...users.value , change.doc.data()];
        users.value = users.value.sort((a,b) => b.estado - a.estado)
    }
    if (change.type === "modified") {
        console.log("Modificou-se o usuário: ", change.doc.data());
        users.value = users.value.map(user=> user.uid === change.doc.data().uid 
        ? {...user , estado: change.doc.data().estado} 
        : user)
        users.value = users.value.sort((a,b) => b.estado - a.estado)

    }
    if (change.type === "removed") {
        console.log("Removeu o usuário: ", change.doc.data());
    }
  });
}); console.log(unsubscribe);

const arraySemUser = computed(() => {
    return users.value.filter(item=> item.uid!== user.value.uid)
})

const users = ref([]);

const uidSelecionado = inject('uidSelecionado');

</script>

<style scoped>
.tabs-zindex{
    z-index: 2000;
}

</style>