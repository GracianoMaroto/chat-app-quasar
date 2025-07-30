<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated style="background-color: #00204a">

      <q-toolbar>

        <img src="/icons/logomarca.png" alt="ConectiFy" style="height: 50px" />
        
        <q-toolbar-title>{{isAuthenticated ? user.email : 'ConectiFy - Chat App'}}</q-toolbar-title>

        <div>
          <q-btn color="negative" v-if="isAuthenticated" @click="sair">
            Sair
          </q-btn>
        </div>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import {useAuth} from '@vueuse/firebase'
import { auth, db } from 'boot/firebase';
import { doc, updateDoc} from 'firebase/firestore';

export default{
  name: "MainLayout",

  components: {},

  setup(){
    const {isAuthenticated , user} = useAuth(auth);
    const sair = async() => {
      try {
        await updateDoc(doc(db, 'usuarios', user.value.uid), {
          estado: false
      });
        await auth.signOut();

      } catch (error) {
        console.log(error)
      }
    }
    return{
      isAuthenticated,
      user,
      sair,
      db,
    }
  }
}
</script>
