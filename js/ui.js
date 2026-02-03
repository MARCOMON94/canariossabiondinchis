// js/ui.js
window.render = function render() {
  const app = document.getElementById("app");
  const S = window.STATE;

  if (S.view === "HOME") {
    app.innerHTML = `
      <h1>Canarios Sabiondinchis 🧠🌋</h1>
      <label>Nombre</label>
      <input id="name" value="${S.name}">
      <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
        <button id="create">Crear sala</button>
        <input id="code" placeholder="Código sala" style="text-transform:uppercase;">
        <button id="join">Unirse</button>
      </div>
    `;
    return;
  }

  if (S.view === "LOBBY") {
    const players = S.players.map(p => `<li>${p.name}</li>`).join("");
    app.innerHTML = `
      <h2>Sala: ${S.roomCode}</h2>
      <p>${S.isHost ? "Eres HOST" : "Eres jugador"}</p>

      <h3>Jugadores</h3>
      <ul>${players}</ul>

      ${S.isHost ? `<button id="start">Iniciar pregunta</button>` : `<p>Esperando a que el host inicie…</p>`}
      <button id="home">Salir</button>
    `;
    return;
  }

  if (S.view === "QUESTION") {
    const q = S.questions[S.room.questionIndex];
    const left = Math.ceil(window.getTimeLeftMs() / 1000);
    const already = S.answers.some(a => a.id === S.playerId);

    app.innerHTML = `
      <h2>⏱️ ${left}s</h2>
      <h3>${q.text}</h3>
      <div>
        ${q.options.map((opt, i) => `
          <button class="opt" data-i="${i}" ${already ? "disabled" : ""}>${opt}</button>
        `).join("")}
      </div>
      <p>Respondidas: ${S.answers.length} / ${S.room.questionLockedPlayers || S.players.length}</p>
    `;
    return;
  }

  if (S.view === "REVEAL") {
    const q = S.questions[S.room.questionIndex];
    const my = S.answers.find(a => a.id === S.playerId);
    const msg = my ? (my.isCorrect ? "✅ Acertaste" : "❌ Fallaste") : "No respondiste";

    app.innerHTML = `
      <h2>${msg}</h2>
      <p><b>Correcta:</b> ${q.options[q.correctIndex]}</p>
      <p>${q.info}</p>

      ${S.isHost ? `<button id="backLobby">Volver al lobby</button>` : `<p>Esperando al host…</p>`}
    `;
    return;
  }
};
