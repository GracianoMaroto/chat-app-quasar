import { defineBoot } from '#q-app/wrappers'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, serverTimestamp } from 'firebase/firestore'
//import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyDxhZR50DtRiJRhcK-7vZWsoLB17k7PRbA",
  authDomain: "firechat-quasar-vue.firebaseapp.com",
  projectId: "firechat-quasar-vue",
  storageBucket: "firechat-quasar-vue.firebasestorage.app",
  messagingSenderId: "654689193429",
  appId: "1:654689193429:web:74a46dcc320c270669815c",
  measurementId: "G-2CF7W3PJ1D"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Inicializa serviços
const auth = getAuth(app);
const db = getFirestore(app);
const marcaTempo = serverTimestamp;

export { db, auth, marcaTempo };

// Boot do Quasar
export default defineBoot(async (/* { app, router, ... } */) => {
  // Você pode colocar inicializações adicionais aqui se precisar
});
