// js/ui.js
window.render = function render() {
  const app = document.getElementById("app");
  if (!app) return;

  const { view } = window.STATE;

  if (view === "HOME") app.innerHTML = window.uiHome();
  else if (view === "LOBBY") app.innerHTML = window.uiLobby();
  else if (view === "QUESTION") app.innerHTML = window.uiQuestion();
  else if (view === "REVEAL") app.innerHTML = window.uiReveal();
  else if (view === "SCORES") app.innerHTML = window.uiScores();
};

window.uiHome = function uiHome() {
  return `
    <div class="screen">
      <h1>Canarios Sabiondinchis 🧠🌋</h1>
      <p>Modo local (por ahora). Luego metemos salas reales.</p>

      <div class="card">
        <label>Tu nombre</label>
        <input id="nameInput" value="${window.STATE.player.name}" />
        <button id="goLobbyBtn">Entrar al lobby</button>
      </div>
    </div>
  `;
};

window.uiLobby = function uiLobby() {
  const name = window.STATE.player.name;
  return `
    <div class="screen">
      <h2>Lobby</h2>
      <p>Jugador: <b>${name}</b></p>

      <div class="card">
        <button id="startBtn">Iniciar partida</button>
      </div>

      <button id="backHomeBtn" class="link">Volver</button>
    </div>
  `;
};

window.uiQuestion = function uiQuestion() {
  const q = window.STATE.questions[window.STATE.currentIndex];
  const timeLeft = window.getTimeLeftMs();
  const locked = window.STATE.answerLocked;

  const buttons = q.options
    .map((opt, i) => {
      const disabled = locked ? "disabled" : "";
      return `<button class="opt" data-idx="${i}" ${disabled}>${opt}</button>`;
    })
    .join("");

  return `
    <div class="screen">
      <div class="topbar">
        <div class="pill">⏱️ ${Math.max(0, Math.ceil(timeLeft / 1000))}s</div>
        <div class="pill">⭐ ${window.STATE.player.score}</div>
      </div>

      <div class="card">
        <h2>${q.text}</h2>
        <div class="opts">${buttons}</div>
      </div>
    </div>
  `;
};

window.uiReveal = function uiReveal() {
  const q = window.STATE.questions[window.STATE.currentIndex];
  const chosen = window.STATE.lastAnswer;
  const correct = q.correctIndex;

  let resultText = "No respondiste.";
  if (chosen !== null) resultText = chosen === correct ? "✅ Correcto" : "❌ Fallaste";

  return `
    <div class="screen">
      <h2>${resultText}</h2>

      <div class="card">
        <p><b>Correcta:</b> ${q.options[correct]}</p>
        <p>${q.info}</p>
      </div>

      <button id="nextBtn">Siguiente</button>
    </div>
  `;
};

window.uiScores = function uiScores() {
  return `
    <div class="screen">
      <h2>Fin</h2>
      <p>Puntuación: <b>${window.STATE.player.score}</b></p>
      <button id="restartBtn">Reiniciar</button>
    </div>
  `;
};
