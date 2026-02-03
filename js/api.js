// js/api.js
const firebaseConfig = {
  // PEGA AQUÍ TU CONFIG DE FIREBASE
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function roomRef(code) {
  return db.collection("rooms").doc(code);
}

function playerRef(code, playerId) {
  return roomRef(code).collection("players").doc(playerId);
}

function answersCol(code) {
  return roomRef(code).collection("answers");
}

// --- reloj de servidor (offset simple) ---
async function syncServerTimeOffset() {
  // Creamos un doc temporal con serverTimestamp y lo leemos para calcular offset.
  const tmpRef = db.collection("_time").doc(window.STATE.playerId);
  await tmpRef.set({ t: firebase.firestore.FieldValue.serverTimestamp() });
  const snap = await tmpRef.get();
  const serverMs = snap.data().t.toMillis();
  window.STATE.serverOffsetMs = serverMs - Date.now();
  await tmpRef.delete();
}

window.nowServerMs = () => Date.now() + window.STATE.serverOffsetMs;

// --- crear/unirse ---
window.createRoom = async function createRoom() {
  const code = Math.random().toString(36).slice(2, 7).toUpperCase();

  await syncServerTimeOffset();

  const r = roomRef(code);
  await r.set({
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

  const r = roomRef(code);
  const snap = await r.get();
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

// --- listeners realtime ---
let unsubRoom = null, unsubPlayers = null, unsubAnswers = null;

window.listenRoom = function listenRoom(code) {
  unsubRoom?.(); unsubPlayers?.(); unsubAnswers?.();

  unsubRoom = roomRef(code).onSnapshot((doc) => {
    window.STATE.room = doc.data() || null;
    window.routeByPhase();
  });

  unsubPlayers = roomRef(code).collection("players").onSnapshot((qs) => {
    window.STATE.players = qs.docs.map(d => ({ id: d.id, ...d.data() }));
    window.render();
  });

  unsubAnswers = answersCol(code).onSnapshot((qs) => {
    window.STATE.answers = qs.docs.map(d => ({ id: d.id, ...d.data() }));
    window.render();

    // Si soy host, puedo cerrar la ronda cuando todos respondan.
    window.maybeCloseQuestionIfAllAnswered();
  });
};

// --- acciones de juego ---
window.startQuestion = async function startQuestion() {
  const code = window.STATE.roomCode;
  if (!window.STATE.isHost) return;

  // Limpia respuestas anteriores
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
  const code = window.STATE.roomCode;
  if (!window.STATE.isHost) return;
  await roomRef(code).update({
    phase: "REVEAL",
    revealAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};
