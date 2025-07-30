<template>
  <div v-if="uidSelecionado !== ''" class="q-mt-xl" ref="RefChat">
    <div class="q-pa-md row justify-center">
        <div style="width: 100%; max-width: 600px">
        <q-chat-message
            v-for="chat in chats" :key="chat.id"
            :name="chat.user"
            :text="[chat.texto]"
            :sent="chat.uid === user.uid"
        />
        </div>
    </div>
    <q-footer>
        <q-form @submit.prevent="enviarMensagem">
            <q-toolbar class="bg-primary text-white row">
                <q-btn round flat icon="delete" class="q-mr-sm" @click="apagarMensagens"/>
                <q-btn round flat icon="insert_emoticon" class="q-mr-sm" />
                <q-input 
                rounded outlined dense class="col-grow q-mr-sm" 
                bg-color="white" 
                v-model="message" 
                placeholder="Type a message" />
                <q-btn round flat icon="send" type="submit" />
            </q-toolbar>
        </q-form>
    </q-footer>
  </div>
    <div v-else class="q-mt-xl">
       <h5 class="q-mt-xl">Selecione um usuário para conversar.</h5>
    </div>
</template>



<script setup>
import { ref, inject, watch, watchEffect } from 'vue';
import { useAuth } from '@vueuse/firebase';
import { marcaTempo, db, auth } from 'src/boot/firebase';
import { 
  doc, collection, addDoc, query, orderBy, onSnapshot, getDocs, deleteDoc
} from 'firebase/firestore';
import { Notify } from 'quasar';

const RefChat = ref(null)
const message = ref('');
const uidSelecionado = inject('uidSelecionado');
const { user } = useAuth(auth);

const enviarMensagem = async () => {
  if(!message.value.trim()){
    return;
  }
  try {
    if (!uidSelecionado.value || !user.value?.uid) {
      console.warn('UIDs não definidos');
      return;
    }

    const objetoMensagem = {
      user: user.value.email,
      texto: message.value,
      fecha: marcaTempo(),
      uid: user.value.uid
    };

    const col1 = collection(doc(db, 'chat', user.value.uid), uidSelecionado.value);
    await addDoc(col1, objetoMensagem);

    const col2 = collection(doc(db, 'chat', uidSelecionado.value), user.value.uid);
    await addDoc(col2, objetoMensagem);

    message.value = '';
  } catch (error) {
    console.log(error);
  }
};

watchEffect(() => {
  console.log('UID selecionado atualizado:', uidSelecionado.value);
});

const chats = ref([]);
let unsubscribe;

watch(
  () => uidSelecionado.value,
  (newUid) => {
    if (unsubscribe) {
      unsubscribe();
    }
    chats.value = []; // limpar mensagens ao trocar de usuário
    if (newUid) {
      obterData(newUid);
    }
  }
);

const obterData = (uidUsuarioSelecionado) => {
  if (!user.value?.uid || !uidUsuarioSelecionado) return;

  const userChatRef = collection(
    db,
    'chat',
    user.value.uid,
    uidUsuarioSelecionado
  );

  const q = query(userChatRef, orderBy('fecha'));

  unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        chats.value.push({ ...change.doc.data(), id: change.doc.id }); 
      }
      if(RefChat.value !== null){
        setTimeout(() => {
          window.scrollTo(0 , RefChat.value.scrollHeight)
        }, 50)
      }
    });
  });
};

  const apagarMensagens = async () => {
    if (!uidSelecionado.value || !user.value?.uid) {
      console.warn("Usuário ou destinatário não definidos.");
      return;
    }

    try {
      const mensagensRef = collection(
        db,
        'chat',
        user.value.uid,
        uidSelecionado.value
      );

      const snapshot = await getDocs(mensagensRef);
      const deletions = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));

      await Promise.all(deletions);

    Notify.create({ type: 'positive', message: 'Mensagens apagadas, recarregue a página!' });
    } catch (error) {
      console.error("Erro ao apagar mensagens:", error);
      Notify.create({ type: 'negative', message: 'Erro ao apagar mensagens, tente novamente.' });

    }
  };
</script>
      