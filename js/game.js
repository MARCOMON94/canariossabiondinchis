// js/game.js
window.getTimeLeftMs = function getTimeLeftMs() {
  const t = window.STATE.timer;
  if (!t.running || !t.startAt) return t.durationMs;
  const elapsed = Date.now() - t.startAt;
  return t.durationMs - elapsed;
};

window.startQuestionTimer = function startQuestionTimer() {
  const t = window.STATE.timer;
  t.running = true;
  t.startAt = Date.now();
  window.STATE.answerLocked = false;
  window.STATE.lastAnswer = null;

  // tick para repintar el contador
  if (window.__tickInterval) clearInterval(window.__tickInterval);
  window.__tickInterval = setInterval(() => {
    if (window.STATE.view !== "QUESTION") return;
    const left = window.getTimeLeftMs();
    window.render();
    if (left <= 0) {
      clearInterval(window.__tickInterval);
      window.endQuestion();
    }
  }, 200);
};

window.endQuestion = function endQuestion() {
  window.STATE.timer.running = false;
  window.STATE.answerLocked = true;
  window.setView("REVEAL");
};

window.submitAnswerLocal = function submitAnswerLocal(idx) {
  if (window.STATE.answerLocked) return;

  window.STATE.answerLocked = true;
  window.STATE.lastAnswer = idx;

  const q = window.STATE.questions[window.STATE.currentIndex];
  const left = Math.max(0, window.getTimeLeftMs());

  // puntuación básica: 100 por acertar + bonus por tiempo
  if (idx === q.correctIndex) {
    const bonus = Math.floor(left / 100); // 0..150 aprox (si 15s)
    window.STATE.player.score += 100 + bonus;
  }

  window.endQuestion();
};

window.nextQuestion = function nextQuestion() {
  window.STATE.currentIndex += 1;
  if (window.STATE.currentIndex >= window.STATE.questions.length) {
    window.setView("SCORES");
    return;
  }
  window.setView("QUESTION");
  window.startQuestionTimer();
};

window.restartGame = function restartGame() {
  window.STATE.currentIndex = 0;
  window.STATE.player.score = 0;
  window.setView("HOME");
};
