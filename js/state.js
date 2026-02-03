// js/state.js
window.STATE = {
  view: "HOME", // HOME | LOBBY | QUESTION | REVEAL | SCORES
  roomCode: null,
  player: {
    id: "local-player",
    name: "Marco",
    avatarDataUrl: null,
    score: 0,
  },
  players: [],

  // Preguntas de prueba (luego las cargas desde JSON)
  questions: [
    {
      id: "q1",
      type: "mcq",
      text: "¿Cuál de estos reptiles es endémico de Gran Canaria?",
      options: ["Gallotia stehlini", "Tarentola mauritanica", "Lacerta lepida", "Iguana iguana"],
      correctIndex: 0,
      info: "Gallotia stehlini es el lagarto de Gran Canaria, endémico de la isla.",
    },
    {
      id: "q2",
      type: "except",
      text: "Todas son aves endémicas de Canarias EXCEPTO:",
      options: ["Pinzón azul", "Canario silvestre", "Paloma rabiche", "Alcaraván común"],
      correctIndex: 3,
      info: "El alcaraván común no es endémico; tiene distribución amplia.",
    },
  ],

  currentIndex: 0,
  answerLocked: false,
  lastAnswer: null,

  timer: {
    running: false,
    durationMs: 15000,
    startAt: null,
    now: Date.now(),
  },
};

window.setView = function setView(view) {
  window.STATE.view = view;
  window.render();
};
