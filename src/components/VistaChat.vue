<template>
  <div class="chat-messages-container" ref="RefChat"> 

    <div v-if="uidSelecionado !== ''" class="q-pa-md row justify-center">
      
      <div class="voltarbutton"> 
        <q-btn round flat icon="send" />
      </div>
      <div style="width: 100%; max-width: 600px">
        <q-chat-message
          v-for="chat in chats"
          :key="chat.id"
          :name="chat.user"
          :text="[chat.texto]"
          :sent="chat.uid === user.uid"
        />
      </div>
    </div>
    <div v-else class="q-mt-xl text-center" id="texto-principal">
      <h3>ConectiFy - Chat APP</h3>
      <h6>Por favor, selecione um usuário para conversar!</h6>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watch, nextTick } from 'vue';
import { useAuth } from '@vueuse/firebase';
import { db, auth } from 'src/boot/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const RefChat = ref(null);
const chats = ref([]);
const uidSelecionado = inject('uidSelecionado');
const { user } = useAuth(auth);

let unsubscribe = null;

watch(
  () => uidSelecionado.value,
  (newUid) => {
    if (unsubscribe) {
      unsubscribe();
    }
    chats.value = [];
    if (newUid) {
      carregarMensagens(newUid);
    }
  }
);

function carregarMensagens(uidSelecionadoValue) {
  if (!user.value?.uid || !uidSelecionadoValue) return;

  const userChatRef = collection(db, 'chat', user.value.uid, uidSelecionadoValue);
  const q = query(userChatRef, orderBy('fecha'));

  unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        chats.value.push({ ...change.doc.data(), id: change.doc.id });
      }
    });

    nextTick(() => {
      if (RefChat.value) {
        RefChat.value.scrollTop = RefChat.value.scrollHeight;
      }
    });
  });
}
</script>

<style scoped>
.chat-messages-container {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.voltarbutton{
  position: fixed;
  align-self: top;
  margin-right: 1500px;
}

#texto-principal{
  color: #00204a;
}
</style>
