// js/state.js
window.STATE = {
  view: "HOME", // HOME | LOBBY | QUESTION | REVEAL
  roomCode: "",
  playerId: localStorage.getItem("playerId") || crypto.randomUUID(),
  name: localStorage.getItem("playerName") || "Jugador",
  isHost: false,

  room: null,
  players: [],
  answers: [],

  // Preguntas locales por ahora (luego JSON)
  questions: [
    {
      text: "¿Cuál de estos reptiles es endémico de Gran Canaria?",
      options: ["Gallotia stehlini", "Tarentola mauritanica", "Lacerta lepida", "Iguana iguana"],
      correctIndex: 0,
      info: "Gallotia stehlini es el lagarto de Gran Canaria.",
    }
  ],

  serverOffsetMs: 0, // para reloj sincronizado
};

localStorage.setItem("playerId", window.STATE.playerId);

window.setView = (v) => { window.STATE.view = v; window.render(); };
