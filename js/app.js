// js/app.js
document.addEventListener("click", async (e) => {
  const t = e.target;

  try {
    if (t.id === "create") {
      const name = document.getElementById("name").value.trim() || "Jugador";
      window.STATE.name = name;
      localStorage.setItem("playerName", name);
      await window.createRoom();
    }

    if (t.id === "join") {
      const name = document.getElementById("name").value.trim() || "Jugador";
      window.STATE.name = name;
      localStorage.setItem("playerName", name);

      const code = document.getElementById("code").value.trim().toUpperCase();
      await window.joinRoom(code);
    }

    if (t.id === "start") {
      await window.startQuestion();
    }

    if (t.classList.contains("opt")) {
      const idx = Number(t.dataset.i);
      await window.submitAnswer(idx);
    }

    if (t.id === "backLobby") {
      // para simplificar: vuelve a lobby (podrías pasar a siguiente pregunta luego)
      await firebase.firestore().collection("rooms").doc(window.STATE.roomCode).update({ phase: "LOBBY" });
    }

    if (t.id === "home") {
      location.reload(); // simple: resetea UI (ya lo haremos fino)
    }

  } catch (err) {
    alert(err.message || String(err));
  }
});

window.addEventListener("load", () => window.setView("HOME"));
