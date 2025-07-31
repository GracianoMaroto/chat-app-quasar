<template>
  <q-list 
  bordered 
  separator
  style="max-height: 100%; overflow-y: auto;"
  >
    <q-item-label header class="text-grey-8 q-pa-sm">Usuários ativos</q-item-label>

    <q-item
      v-for="user in arraySemUser"
      :key="user.uid"
      clickable
      @click="uidSelecionado = user.uid"
      :active="uidSelecionado === user.uid"
      active-class="bg-primary text-white"
    >
      <q-item-section avatar>
        <q-avatar color="primary" text-color="white">
          {{ user.email.charAt(0).toUpperCase() }}
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ user.email }}</q-item-label>
        <q-item-label caption>{{ user.estado ? 'Online' : 'Offline' }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>

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
.q-list {
  min-height: 100vh;
  overflow-y: auto;
}

:root, html, body, #q-app {
  height: 100%;
  margin: 0;
}

.q-page {
  height: 100%;
}

</style>
