// Firebase v10 (CDN modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { firebaseConfig, APP_SUPPORT_EMAIL } from "./firebase-config.js";

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos de UI (existem/serão adicionados no index.html)
const el = (id) => document.getElementById(id);
const emailInput   = () => el("authEmail");
const sendBtn      = () => el("btnSendLink");
const completeBox  = () => el("authBox");
const statusSpan   = () => el("authStatus");
const logoutBtn    = () => el("btnLogout");

// 1) Completar login se o utilizador abriu o link do email
(async function completeIfEmailLink(){
  try {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem("ai.trainer.emailForSignIn");
      if (!email) {
        email = prompt("Confirma o teu email para concluir:");
      }
      const cred = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem("ai.trainer.emailForSignIn");
      console.log("Login concluído:", cred.user.email);
      // Limpa os parâmetros feios da URL
      history.replaceState({}, "", window.location.pathname + window.location.hash);
    }
  } catch (e) {
    console.error(e);
    alert("Falha ao concluir sessão: " + (e?.message||e));
  }
})();

// 2) Observa o estado de auth e atualiza a UI
onAuthStateChanged(auth, (user) => {
  if (user) {
    statusSpan().textContent = `Autenticado: ${user.email}`;
    completeBox().classList.add("logged");
  } else {
    statusSpan().textContent = "Não autenticado";
    completeBox().classList.remove("logged");
  }
});

// 3) Enviar link mágico para o email
export async function sendMagicLink(){
  try {
    const email = (emailInput().value||"").trim();
    if(!email){ alert("Escreve o teu email."); return; }

    const actionCodeSettings = {
      url: window.location.origin + window.location.pathname + "#conta",
      handleCodeInApp: true
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem("ai.trainer.emailForSignIn", email);
    alert(`Enviámos um link de acesso para ${email}. Verifica a tua caixa de entrada/spam.`);
  } catch(e){
    console.error(e);
    alert("Não foi possível enviar o link: " + (e?.message||e));
  }
}

// 4) Logout
export async function doLogout(){
  try {
    await signOut(auth);
  } catch(e){
    console.error(e);
    alert("Erro ao sair: " + (e?.message||e));
  }
}

// Expor email de suporte (se quiseres mostrar no UI)
window.__APP_SUPPORT_EMAIL__ = APP_SUPPORT_EMAIL;
