import { MODULE_ID } from "../constants.js";

export function getActorNotes() {
  try { return game.settings.get(MODULE_ID, "actor-notes") ?? {}; }
  catch { return {}; }
}

export async function saveActorNote(actorId, text) {
  const notes = getActorNotes();
  if (text.trim() === "") {
    delete notes[actorId];
  } else {
    notes[actorId] = text.trim();
  }
  await game.settings.set(MODULE_ID, "actor-notes", notes);
}

// Attache la modale de notes à un conteneur
export function registerNoteModal(app) {
  const modal = app.element.querySelector(".hp4-note-modal");
  if (!modal) return;

  let currentActorId = null;

  app.element.querySelectorAll(".hp4-note-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentActorId = btn.dataset.id;
      const actor = game.actors.get(currentActorId);
      const notes = getActorNotes();

      modal.querySelector(".hp4-note-actor-name").textContent = actor?.name ?? "?";
      modal.querySelector(".hp4-note-textarea").value = notes[currentActorId] ?? "";
      modal.style.display = "flex";
    });
  });

  modal.querySelector(".hp4-note-cancel").addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.querySelector(".hp4-note-save").addEventListener("click", async () => {
    const text = modal.querySelector(".hp4-note-textarea").value;
    await saveActorNote(currentActorId, text);
    modal.style.display = "none";
    app.render();
  });
}