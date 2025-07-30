<template>
  <q-page padding>
    
    <VistaAcesso v-if="!isAuthenticated"/>

    <div v-else>
      <VistaUsuariosAtivos/>
      <VistaChat/>
    </div>


  </q-page>


</template>





<script>
import VistaAcesso from 'src/components/VistaAcesso.vue';
import {useAuth} from '@vueuse/firebase'
import { auth } from 'src/boot/firebase';
import VistaUsuariosAtivos from 'src/components/VistaUsuariosAtivos.vue';
import VistaChat from 'src/components/VistaChat.vue';
import { provide , ref} from 'vue';


export default{
  components: {VistaAcesso , VistaUsuariosAtivos , VistaChat},
  setup(){
    const {user, isAuthenticated} = useAuth(auth);
    const uidSelecionado = ref('')
    provide('uidSelecionado' , uidSelecionado)

    return{
      isAuthenticated,
      user
    }
  }
};


</script>
