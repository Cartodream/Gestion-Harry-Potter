import { MODULE_ID } from "../constants.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const START_HOUR = 7;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;
function formatHour(decimal) {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
export class TimetableApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "hp4-timetable-app",
    classes: ["hp4-timetable"],
    window: { title: "Emploi du temps", resizable: true },
    position: { width: 960, height: 680 },
  };

  static PARTS = {
    main: { template: "modules/gestion-harry-potter/templates/timetable.hbs" },
  };

  // État de la modale de création
  #modal = { open: false, day: null, startH: null };

  static getData() {
    try { return game.settings.get(MODULE_ID, "timetable-data") ?? {}; }
    catch { return {}; }
  }

  static async saveData(data) {
    await game.settings.set(MODULE_ID, "timetable-data", data);
  }

  async _prepareContext() {
    const data = TimetableApp.getData();
    const isGM = game.user.isGM;

    // Heures de 7h à 22h
    const hours = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      hours.push(`${h}h`);
    }

    // Construire les colonnes par jour
    const days = DAYS.map((label, dayIndex) => {
      const events = Object.entries(data)
        .filter(([, e]) => e.day === dayIndex)
        .map(([id, e]) => {
          const top = ((e.startHour - START_HOUR) / TOTAL_HOURS) * 100;
          const height = ((e.endHour - e.startHour) / TOTAL_HOURS) * 100;
          return { id, ...e, top, height };
        });
      return { label, dayIndex, events };
    });

    return { days, hours, isGM, startHour: START_HOUR, totalHours: TOTAL_HOURS };
  }

  _onRender(context, options) {
    super._onRender(context, options);

    if (context.isGM) {
      // Clic sur la grille → ouvrir modale de création
      this.element.querySelectorAll(".hp4-day-col").forEach(col => {
        col.addEventListener("click", (e) => {
          if (e.target.closest(".hp4-event")) return;
          const dayIndex = parseInt(col.dataset.day);
          const rect = col.getBoundingClientRect();
          const relY = e.clientY - rect.top;
          const ratio = relY / rect.height;
          const hour = START_HOUR + Math.floor(ratio * TOTAL_HOURS);
          this.#openCreateModal(dayIndex, hour);
        });
      });

      // Supprimer un événement
      this.element.querySelectorAll(".hp4-event-delete").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const id = e.currentTarget.dataset.id;
          const data = TimetableApp.getData();
          delete data[id];
          await TimetableApp.saveData(data);
          this.render();
        });
      });
    }

    // Modale de création
    this.#setupModal();
  }

  #openCreateModal(day, startH) {
    const modal = this.element.querySelector(".hp4-tt-modal");
    if (!modal) return;

    this.#modal = { day, startH };

    modal.querySelector("#hp4-tt-day").value = day;
    modal.querySelector("#hp4-tt-title").value = "";
    modal.querySelector("#hp4-tt-start").value = `${String(startH).padStart(2,"0")}:00`;
    modal.querySelector("#hp4-tt-end").value = `${String(Math.min(startH + 1, END_HOUR)).padStart(2,"0")}:00`;
    modal.querySelector("#hp4-tt-color").value = "#c0392b";
    modal.style.display = "flex";
    modal.querySelector("#hp4-tt-title").focus();
  }

  #setupModal() {
    const modal = this.element.querySelector(".hp4-tt-modal");
    if (!modal) return;

    modal.querySelector(".hp4-tt-cancel").addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.querySelector(".hp4-tt-save").addEventListener("click", async () => {
      const title = modal.querySelector("#hp4-tt-title").value.trim();
      if (!title) return;

      const day = parseInt(modal.querySelector("#hp4-tt-day").value);
      const startVal = modal.querySelector("#hp4-tt-start").value;
      const endVal = modal.querySelector("#hp4-tt-end").value;
      const color = modal.querySelector("#hp4-tt-color").value;

      const startHour = parseInt(startVal.split(":")[0]) + parseInt(startVal.split(":")[1]) / 60;
      const endHour = parseInt(endVal.split(":")[0]) + parseInt(endVal.split(":")[1]) / 60;

      if (endHour <= startHour) {
        ui.notifications.warn("L'heure de fin doit être après l'heure de début.");
        return;
      }

      const data = TimetableApp.getData();
      const id = `evt-${Date.now()}`;
      data[id] = { title, day, startHour, endHour, color };
      await TimetableApp.saveData(data);

      modal.style.display = "none";
      this.render();
    });
  }
}