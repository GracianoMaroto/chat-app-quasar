<template>
  <q-footer class="bg-white" height-hint="60" style="padding: 4px 12px;">
    <q-form @submit.prevent="enviarMensagem">
      <q-toolbar class="bg-primary text-white row q-pa-xs" style="gap: 8px;">
        
        <q-btn round flat icon="delete" @click="apagarMensagens" />

        <div class="emoji-wrapper" style="position: relative;">
          <q-btn round flat icon="insert_emoticon" @click="toggleEmojiSelector" />
          <div v-show="showEmojis" class="emoji-popup">
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
          rounded outlined dense
          class="col-grow"
          bg-color="white"
          v-model="message"
          placeholder="Type a message"
          autofocus
        />
        
        <q-btn round flat icon="send" type="submit" />
      </q-toolbar>
    </q-form>
  </q-footer>
</template>

<script setup>
import { ref, inject, nextTick, onMounted } from 'vue';
import { useAuth } from '@vueuse/firebase';
import { marcaTempo, db, auth } from 'src/boot/firebase';
import { doc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { Notify } from 'quasar';

const message = ref('');
const messageInput = ref(null);
const uidSelecionado = inject('uidSelecionado');
const { user } = useAuth(auth);

const enviarMensagem = async () => {
  if (!message.value.trim()) return;

  try {
    if (!uidSelecionado.value || !user.value?.uid) return;

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
    console.error(error);
  }
};

const apagarMensagens = async () => {
  if (!uidSelecionado.value || !user.value?.uid) return;

  try {
    const mensagensRef = collection(db, 'chat', user.value.uid, uidSelecionado.value);
    const snapshot = await getDocs(mensagensRef);
    const deletions = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(deletions);

    Notify.create({ type: 'positive', message: 'Mensagens apagadas, recarregue a página!' });
  } catch (error) {
    console.log(error);
    Notify.create({ type: 'negative', message: 'Erro ao apagar mensagens, tente novamente.' });
  }
};

// Emojis
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

onMounted(() => {
  fetch('https://emoji-api.com/emojis?access_key=68bce11c342663f942203b6361c0217483da3b5c')
    .then(res => res.json())
    .then(data => {
      emojis.value = data;
    });
});
</script>

<style scoped>
.emoji-popup {
  position: absolute;
  bottom: 50px;
  left: 0;
  width: 300px;
  height: 300px;
  background: white;
  border: 2px solid #007bff;
  border-radius: 6px;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  z-index: 1000;
}

.emoji-list {
  list-style: none;
  padding: 5px;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  font-size: 18px;
}

.emoji-item {
  cursor: pointer;
  user-select: none;
  line-height: 1;
}
</style>