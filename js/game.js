// js/game.js
window.routeByPhase = function routeByPhase() {
  const room = window.STATE.room;
  if (!room) return;

  if (room.phase === "LOBBY") window.setView("LOBBY");
  if (room.phase === "QUESTION") window.setView("QUESTION");
  if (room.phase === "REVEAL") window.setView("REVEAL");
};

window.getTimeLeftMs = function getTimeLeftMs() {
  const room = window.STATE.room;
  if (!room || room.phase !== "QUESTION" || !room.questionStartAt) return 0;
  const startMs = room.questionStartAt.toMillis();
  const elapsed = window.nowServerMs() - startMs;
  return Math.max(0, room.durationMs - elapsed);
};

window.maybeCloseQuestionIfAllAnswered = function maybeCloseQuestionIfAllAnswered() {
  const room = window.STATE.room;
  if (!room || room.phase !== "QUESTION") return;
  if (!window.STATE.isHost) return;

  const expected = room.questionLockedPlayers || window.STATE.players.length;
  const answered = window.STATE.answers.length;

  // Cierra si todos han respondido
  if (answered >= expected) {
    window.revealNow();
  }
};

// Cierre por tiempo (lo hace el host, usando reloj sincronizado)
setInterval(() => {
  const room = window.STATE.room;
  if (!room || room.phase !== "QUESTION") return;
  if (!window.STATE.isHost) return;

  if (window.getTimeLeftMs() <= 0) {
    window.revealNow();
  }
}, 200);
