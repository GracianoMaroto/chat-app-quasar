<template>
  <q-page padding style="height: 100vh; display: flex;">

    <!-- Se não autenticado: ocupa toda tela -->
    <VistaAcesso v-if="!isAuthenticated" style="flex: 1" />

    <!-- Se autenticado -->
    <template v-else>
      <!-- Sidebar lateral -->
      <aside
        style="
          width: 300px;
          height: 100vh;
          border-right: 1px solid #ccc;
          overflow-y: auto;
          background-color: #f5f5f5;
        "
      >
        <VistaUsuariosAtivos />
      </aside>

      <!-- Área do chat (flex column) -->
      <section
        style="
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: white;
        "
      >
        <!-- Lista de mensagens scrollável -->
        <div
          style="
            flex-grow: 1;
            overflow-y: auto;
            padding: 16px;
            padding-bottom: 80px; /* evita esconder mensagens atrás do footer */
          "
        >
          <VistaChatSemFooter />
        </div>

        <!-- Footer aparece só se uidSelecionado preenchido -->
        <div v-if="uidSelecionado !== ''" style="border-top: 1px solid #ccc;">
          <ChatFooter />
        </div>
      </section>
    </template>
  </q-page>
</template>

<script setup>
import { ref, provide } from 'vue';
import { useAuth } from '@vueuse/firebase';
import { auth } from 'src/boot/firebase';

import VistaAcesso from 'src/components/VistaAcesso.vue';
import VistaUsuariosAtivos from 'src/components/VistaUsuariosAtivos.vue';
import VistaChatSemFooter from 'src/components/VistaChatSemFooter.vue';
import ChatFooter from 'src/components/ChatFooter.vue';

const { isAuthenticated } = useAuth(auth);
const uidSelecionado = ref('');
provide('uidSelecionado', uidSelecionado);
</script>
