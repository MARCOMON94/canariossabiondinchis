// js/app.js
function bindEvents() {
  document.body.addEventListener("click", (e) => {
    const target = e.target;

    if (target.id === "goLobbyBtn") {
      const nameInput = document.getElementById("nameInput");
      window.STATE.player.name = (nameInput?.value || "Jugador").trim() || "Jugador";
      window.setView("LOBBY");
      return;
    }

    if (target.id === "backHomeBtn") {
      window.setView("HOME");
      return;
    }

    if (target.id === "startBtn") {
      window.STATE.currentIndex = 0;
      window.setView("QUESTION");
      window.startQuestionTimer();
      return;
    }

    if (target.classList.contains("opt")) {
      const idx = Number(target.dataset.idx);
      window.submitAnswerLocal(idx);
      return;
    }

    if (target.id === "nextBtn") {
      window.nextQuestion();
      return;
    }

    if (target.id === "restartBtn") {
      window.restartGame();
      return;
    }
  });
}

window.addEventListener("load", () => {
  bindEvents();
  window.render();
});
