// billing.js — Barra de conta + limites Free + Checkout Stripe (£, 7 dias trial)
(function () {
  // ===== Firebase =====
  const firebaseConfig = {
    apiKey: "<<<FIREBASE_apiKey>>>",
    authDomain: "<<<FIREBASE_projectId>>>.firebaseapp.com",
    projectId: "<<<FIREBASE_projectId>>>",
    storageBucket: "<<<FIREBASE_projectId>>>.appspot.com",
    messagingSenderId: "<<<FIREBASE_messagingSenderId>>>",
    appId: "<<<FIREBASE_appId>>>"
  };

  // ===== Stripe Price IDs (libras £) =====
  // Cria no Stripe:
  //  - Mensal £14.99 -> PRICE_ID_MENSAL
  //  - Anual  £149   -> PRICE_ID_ANUAL
  const PRICE_LABELS = {
    mensal: "£14.99/mês (7 dias grátis)",
    anual:  "£149/ano (poupa ~17%)"
  };

  function loadScript(src){return new Promise(r=>{const s=document.createElement("script");s.src=src;s.onload=r;document.head.appendChild(s);});}
  async function ensureFirebase(){
    if(!window.firebase){
      await loadScript("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/10.12.4/firebase-auth-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore-compat.js");
    }
    if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window.auth=firebase.auth(); window.db=firebase.firestore();
  }

  function injectBar(){
    const el=document.createElement("div");
    el.id="billing-bar";
    el.style.cssText="position:fixed;left:12px;top:8px;z-index:9999;display:flex;gap:8px;align-items:center;background:#0f1a33;color:#fff;border:1px solid #223;box-shadow:0 6px 20px rgba(0,0,0,.3);padding:8px 10px;border-radius:12px";
    el.innerHTML=`
      <button id="btnLogin">Entrar</button>
      <button id="btnLogout" style="display:none">Sair</button>

      <select id="pricePlan" class="btn">
        <option value="mensal">Premium Mensal (${PRICE_LABELS.mensal})</option>
        <option value="anual">Premium Anual (${PRICE_LABELS.anual})</option>
      </select>
      <button id="btnUpgrade">Fazer Upgrade</button>

      <span id="userBadge" style="opacity:.85"></span>
      <span id="planBadge" style="background:#ffd54a;color:#222;padding:2px 6px;border-radius:8px;margin-left:6px;font-weight:700">FREE</span>
    `;
    document.body.appendChild(el);
  }

  function weekKey(){
    const d=new Date(); const onejan=new Date(d.getFullYear(),0,1);
    const w=Math.ceil(((d-onejan)/86400000 + onejan.getDay() + 1)/7);
    return `${d.getFullYear()}-W${String(w).padStart(2,"0")}`;
  }

  async function mount(){
    await ensureFirebase(); injectBar();

    const btnLogin = document.getElementById("btnLogin");
    const btnLogout= document.getElementById("btnLogout");
    const btnUpgrade=document.getElementById("btnUpgrade");
    const pricePlan = document.getElementById("pricePlan");
    const userBadge = document.getElementById("userBadge");
    const planBadge = document.getElementById("planBadge");

    btnLogin.addEventListener("click", async ()=>{
      const prov = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(prov);
    });
    btnLogout.addEventListener("click", async ()=>auth.signOut());

    // === Checkout Stripe (chama Netlify Function) ===
    btnUpgrade.addEventListener("click", async ()=>{
      const user = auth.currentUser;
      if(!user){ alert("Entra primeiro."); return; }
      const idToken = await user.getIdToken();
      const plano = pricePlan.value; // "mensal" | "anual"
      const r = await fetch("/.netlify/functions/create-checkout", {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:"Bearer "+idToken },
        body:JSON.stringify({ plano })
      });
      const { url, error } = await r.json();
      if(error){ alert(error); return; }
      location.href = url;
    });

    // === Estado do utilizador / plano ===
    auth.onAuthStateChanged(async user=>{
      if(!user){
        btnLogin.style.display=""; btnLogout.style.display="none";
        userBadge.textContent="Visitante"; planBadge.textContent="FREE";
        window.USER_PLAN="free"; return;
      }
      btnLogin.style.display="none"; btnLogout.style.display="";
      userBadge.textContent=user.displayName||user.email;

      const ref = db.collection("users").doc(user.uid);
      const snap = await ref.get();
      const data = snap.data() || {};

      window.USER_PLAN = data.plan || "free";
      const prem = window.USER_PLAN === "premium";
      planBadge.textContent = prem ? "PREMIUM" : "FREE";
      planBadge.style.background = prem ? "#5eead4" : "#ffd54a";
      planBadge.style.color = prem ? "#0b1220" : "#222";
    });

    // === Limite FREE (2 treinos/semana) ===
    window.canCreateWorkout = async function(){
      const user = auth.currentUser; if(!user) return false;
      const ref = db.collection("users").doc(user.uid);
      const snap = await ref.get(); const data = snap.data() || {};
      if ((data.plan||"free")==="premium") return true;
      const wk = weekKey();
      if (data.weekRef !== wk) {
        await ref.set({ weekRef:wk, weeklyCounts:{workouts:0} }, { merge:true });
        return true;
      }
      const count = data.weeklyCounts?.workouts || 0;
      if (count >= 2) return false;
      await ref.set({ weeklyCounts:{ ...(data.weeklyCounts||{}), workouts:count+1 } }, { merge:true });
      return true;
    };

    window.requirePremium = function(){
      if (window.USER_PLAN !== "premium") {
        alert("Funcionalidade Premium. Faz upgrade (7 dias grátis) ✨");
        return false;
      }
      return true;
    };
  }

  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
