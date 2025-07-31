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

            <!-- Envolva botão e popup na emoji-wrapper -->
            <div class="emoji-wrapper">
              <q-btn round flat icon="insert_emoticon" @click="toggleEmojiSelector" />
              <div ref="emojiSelector" class="emoji-popup" v-show="showEmojis">
                <ul class="emoji-list">
                  <li
                    v-for="emoji in emojis"
                    :key="emoji.slug"
                    class="emoji-item"
                    @click="insertEmoji(emoji.character)"
                  >
                    {{ emoji.character }}
                  </li>
                </ul>
              </div>
            </div>

            <q-input 
              ref="messageInput"
              rounded outlined dense class="col-grow q-mr-sm" 
              bg-color="white" 
              v-model="message" 
              placeholder="Type a message" />
            <q-btn round flat icon="send" type="submit"/>
          </q-toolbar>

        </q-form>
      </q-footer>

  </div>
    <div v-else class="q-mt-xl">
       <h5 class="q-mt-xl">Selecione um usuário para conversar.</h5>
    </div>
</template>



<script setup>
import { ref, inject, watch, nextTick, onMounted} from 'vue';
import { useAuth } from '@vueuse/firebase';
import { marcaTempo, db, auth } from 'src/boot/firebase';
import { 
  doc, collection, addDoc, query, orderBy, onSnapshot, getDocs, deleteDoc
} from 'firebase/firestore';
import { Notify } from 'quasar';

const RefChat = ref(null)
const message = ref('');
const messageInput = ref(null);
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

const chats = ref([]);
let unsubscribe = null;


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
// ---------------------------- EMOJIS
const emojiSelector = ref(null);
const showEmojis = ref(false);
const emojis = ref([]);


const toggleEmojiSelector = () => {
  showEmojis.value = !showEmojis.value;
};

const insertEmoji = (emojiChar) => {
  const input = messageInput.value?.$el?.querySelector('input') || messageInput.value;
  if (!input) return;

  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;

  const before = message.value.slice(0, start);
  const after = message.value.slice(end);

  message.value = before + emojiChar + after;

  nextTick(() => {
    input.focus();
    input.setSelectionRange(start + emojiChar.length, start + emojiChar.length);
  });
};


onMounted(async () => {
  await nextTick();

  fetch('https://emoji-api.com/emojis?access_key=68bce11c342663f942203b6361c0217483da3b5c')
    .then(res => res.json())
    .then(data => {
      emojis.value = data;
    });
});

</script>
      
<style scoped>

.emoji-wrapper {
  position: relative;
  display: inline-block;
}

/* Popup do emoji */
.emoji-popup {
  position: absolute;
  bottom: 50px; /* fica 50px acima do botão */
  left: 0;
  width: 300px;
  height: 300px;
  background: white;
  border: 2px solid #007BFF; /* borda azul */
  border-radius: 6px;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  z-index: 1000;
}

/* Lista de emojis */
.emoji-list {
  list-style: none;
  padding: 5px;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  font-size: 18px;
}

/* Cada emoji clicável */
.emoji-item {
  cursor: pointer;
  user-select: none;
  line-height: 1;
}

</style>
