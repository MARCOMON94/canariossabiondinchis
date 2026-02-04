// js/api.js
console.log("api.js cargado ✅");

// 1) Define funciones SIEMPRE para que app.js no explote
window.createRoom = async function createRoom() {
  alert("createRoom OK pero Firebase no está configurado todavía.");
};

window.joinRoom = async function joinRoom(code) {
  alert("joinRoom OK pero Firebase no está configurado todavía. Código: " + code);
};

// 2) Intenta inicializar Firebase (si falla, lo verás en consola)
let db = null;

try {
  // PEGA AQUÍ TU CONFIG REAL DE FIREBASE:
  const firebaseConfig = {
    // apiKey: "...",
    // authDomain: "...",
    // projectId: "...",
    // ...
  };

  // Si no has pegado config, esto fallará. Y es normal.
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log("Firebase inicializado ✅", db);

  // 3) Reemplaza las funciones con las reales (ya con Firebase)
  function roomRef(code) {
    return db.collection("rooms").doc(code);
  }
  function playerRef(code, playerId) {
    return roomRef(code).collection("players").doc(playerId);
  }
  function answersCol(code) {
    return roomRef(code).collection("answers");
  }

  async function syncServerTimeOffset() {
    const tmpRef = db.collection("_time").doc(window.STATE.playerId);
    await tmpRef.set({ t: firebase.firestore.FieldValue.serverTimestamp() });
    const snap = await tmpRef.get();
    const serverMs = snap.data().t.toMillis();
    window.STATE.serverOffsetMs = serverMs - Date.now();
    await tmpRef.delete();
  }

  window.nowServerMs = () => Date.now() + (window.STATE.serverOffsetMs || 0);

  window.createRoom = async function createRoom() {
    const code = Math.random().toString(36).slice(2, 7).toUpperCase();

    await syncServerTimeOffset();

    await roomRef(code).set({
      phase: "LOBBY",
      hostId: window.STATE.playerId,
      questionIndex: 0,
      durationMs: 15000,
      questionStartAt: null,
      questionLockedPlayers: 0,
      revealAt: null,
    });

    await playerRef(code, window.STATE.playerId).set({
      name: window.STATE.name,
      score: 0,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
    });

    window.STATE.roomCode = code;
    window.STATE.isHost = true;

    window.listenRoom(code);
    window.setView("LOBBY");
  };

  window.joinRoom = async function joinRoom(code) {
    await syncServerTimeOffset();

    const snap = await roomRef(code).get();
    if (!snap.exists) throw new Error("Sala no existe");

    await playerRef(code, window.STATE.playerId).set({
      name: window.STATE.name,
      score: 0,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    window.STATE.roomCode = code;
    window.STATE.isHost = snap.data().hostId === window.STATE.playerId;

    window.listenRoom(code);
    window.setView("LOBBY");
  };

  // listeners
  let unsubRoom = null, unsubPlayers = null, unsubAnswers = null;

  window.listenRoom = function listenRoom(code) {
    unsubRoom?.(); unsubPlayers?.(); unsubAnswers?.();

    unsubRoom = roomRef(code).onSnapshot((doc) => {
      window.STATE.room = doc.data() || null;
      window.routeByPhase?.();
      window.render?.();
    });

    unsubPlayers = roomRef(code).collection("players").onSnapshot((qs) => {
      window.STATE.players = qs.docs.map(d => ({ id: d.id, ...d.data() }));
      window.render?.();
    });

    unsubAnswers = answersCol(code).onSnapshot((qs) => {
      window.STATE.answers = qs.docs.map(d => ({ id: d.id, ...d.data() }));
      window.render?.();
      window.maybeCloseQuestionIfAllAnswered?.();
    });
  };

  window.startQuestion = async function startQuestion() {
    if (!window.STATE.isHost) return;
    const code = window.STATE.roomCode;

    const ansSnap = await answersCol(code).get();
    const batch = db.batch();
    ansSnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    const playersCount = window.STATE.players.length;

    await roomRef(code).update({
      phase: "QUESTION",
      questionStartAt: firebase.firestore.FieldValue.serverTimestamp(),
      questionLockedPlayers: playersCount,
      revealAt: null,
    });
  };

  window.submitAnswer = async function submitAnswer(optionIndex) {
    const code = window.STATE.roomCode;
    const q = window.STATE.questions[window.STATE.room.questionIndex];
    const isCorrect = optionIndex === q.correctIndex;

    await answersCol(code).doc(window.STATE.playerId).set({
      optionIndex,
      isCorrect,
      answeredAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  };

  window.revealNow = async function revealNow() {
    if (!window.STATE.isHost) return;
    const code = window.STATE.roomCode;
    await roomRef(code).update({ phase: "REVEAL" });
  };

  console.log("Funciones Firebase listas ✅", typeof window.createRoom);

} catch (err) {
  console.error("Firebase NO inicializado ❌", err);
  // Pero createRoom/joinRoom ya existen (las de alert), así que no rompe nada.
}
