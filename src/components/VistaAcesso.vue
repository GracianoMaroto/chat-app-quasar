<template>
    <div class="quadrado">
        <div class="lado-esquerdo text-white">
            <img src="/public/icons/logo.png" size: height="400px"  width="450px"/>
        </div>
        <div class="lado-direito">
            <div class="container" elevated>
                <p>Welcome to ConectiFy!</p>
                <div class="form">
                    <h4>{{acessar ? 'Login into your account' : 'Sign Up to your account'}}</h4>
                    <q-form class="q-gutter-md" @submit.prevent="processarFormulario">
                        <q-input v-if="!acessar" label="Name"/>
                        <q-input v-if="!acessar" label="Date of birth" type="date"/>
                        <q-input label="Email" v-model="email"/>
                        <q-input label="Password" v-model="password" type="password"/>
                        <q-btn :label="acessar ? 'Login' : 'Cadastrar'" type="submit" color="primary"/>
                        <q-btn color="primary" outline v-if="!acessar" @click="acessar=true">
                            Já tem conta?</q-btn>
                        <q-btn color="negative" outline v-else @click="acessar=false">Não tem conta?</q-btn>
                    </q-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@vueuse/firebase'
import { Notify } from 'quasar';
import { db } from 'boot/firebase'
import { /*getFirestore ,*/ doc, setDoc, updateDoc } from 'firebase/firestore';

const email = ref('');
const password = ref('');
const acessar = ref(true);
const auth = getAuth();
const {isAuthenticated , user} = useAuth(auth);
console.log(isAuthenticated , user)

const processarFormulario = async () => {
    if(!email.value.trim() || !password.value.trim()){
        console.log('Campos vazios')   
        Notify.create({
                type: 'warning',
                message: 'Preencha todos os campos.'
            }); 
            return;
    }
    try {
        if (!acessar.value){
        // Registrar
            const usuario = await createUserWithEmailAndPassword(auth, email.value , password.value);
            Notify.create({
                    type: 'positive',
                    message: `Bem-vindo, ${usuario.user.email}! Registro realizado com sucesso.`
        });
        await setDoc(doc(db, 'usuarios', usuario.user.uid), {
            email: usuario.user.email,
            estado: true,
            uid: usuario.user.uid
        });
        } else{
            //Login
        const usuario = await signInWithEmailAndPassword(auth, email.value , password.value);
        Notify.create({
                type: 'positive',
                message: `Login realizado! Olá, ${usuario.user.email}`
            });
        await updateDoc(doc(db, 'usuarios', usuario.user.uid), {
            estado: true
        });
            email.value = '';
            password.value = '';
        } 
    } catch (error) {
        console.log(error)
            Notify.create({
                type: 'negative',
                message: `Verifique as informações digitadas!`
            });
    }
};

</script>

<style scoped>

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.quadrado {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  min-height: 90vh;
  max-height: 90vh;
  box-sizing: border-box;
}

.lado-esquerdo {
  background-color: #00204a;
  flex: 1 1 40%;
  min-width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2rem;
  box-sizing: border-box;
}

.lado-direito {
  background-color: #eff0f4;
  flex: 1 1 60%;
  min-width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
  border-radius: 8px;
}

.container {
  background-color: white;
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  box-sizing: border-box;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-radius: 8px;
  color: #00204a;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align:left;
}

/* Mobile Responsivo */
@media (max-width: 768px) {
  .quadrado {
    flex-direction: column;
  }

  .lado-esquerdo,
  .lado-direito {
    flex: 1 1 100%;
    padding: 1.5rem;
  }

  .container {
    width: 90%;
    padding: 1.5rem;
  }
}


</style>