<template>
<q-page padding style="height: 94vh; display: flex; overflow: hidden;">
  <VistaAcesso v-if="!isAuthenticated" style="flex: 1" />

  <template v-else>
    <!-- Botão de menu (mobile) -->
    <!-- <q-btn
      flat
      round
      icon="menu"
      class="q-mr-sm q-mt-sm q-ml-sm absolute z-top"
      v-if="$q.screen.lt.md"
      @click="sidebarAberta = true"
    /> -->

    <!-- SIDEBAR FIXA (Desktop) -->
    <aside
      class="sidebar-fixa"
    >
      <VistaUsuariosAtivos />
    </aside>

    <!-- SIDEBAR DRAWER (Mobile)
    <q-drawer
      class="bg-grey-1"
      v-model="sidebarAberta"
      side="left"
      overlay
      :breakpoint="768"
      content-class="q-pa-sm"
      v-if="$q.screen.lt.md"
    >
      <VistaUsuariosAtivos />
    </q-drawer> -->

    <!-- ÁREA DO CHAT -->
    <!-- Envolve tudo num container que usa flexbox em coluna -->
    <section class="section">
      <!-- Conteúdo scrollável -->
      <div
        style="
          flex: 1;
          overflow-y: auto;
          padding: 0px;
          padding-bottom: 80px; /* deixa espaço pro footer fixo */
        "
      >
        <VistaChat />
      </div>

      <!-- Footer fixo -->
      <div
        v-if="uidSelecionado !== ''"
        style="
          position: sticky;
          bottom: -25px;  
          z-index: 10;
          background: white;
          border-top: 1px solid #ccc;
        "
      >
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
import ChatFooter from 'src/components/ChatFooter.vue';
import VistaChat from 'src/components/VistaChat.vue';


const { isAuthenticated } = useAuth(auth);

const uidSelecionado = ref('');

provide('uidSelecionado', uidSelecionado);
// const sidebarAberta = ref(false);
// provide('sidebarAberta', sidebarAberta);

</script>


<style scoped>

  /* Sidebar fixa só em telas maiores */
  .sidebar-fixa {
  width: 300px;
  height: 95vh;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  background-color: #f5f5f5;
  position: fixed;  /* fixa na tela */
  left: 0;
  top: 50px;
  bottom: 0;
  }

  .section{
    margin-left: 280px;  /* para não ficar atrás da sidebar fixa */
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .section::before{
    content: "";
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/icons/bgChat.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    .sidebar-desktop {
      display: none;
    }
  }
</style>