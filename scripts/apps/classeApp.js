import { MODULE_ID } from "../constants.js";
import { getActorNotes, registerNoteModal } from "../utils/notes.js";

const YEARS = [
  "1ère année", "2ème année", "3ème année", "4ème année",
  "5ème année", "6ème année", "7ème année"
];

const HOUSES = [
  { key: "gryffondor", label: "Gryffondor", icon: "fas fa-lion" },
  { key: "serdaigle",  label: "Serdaigle",  icon: "fas fa-crow" },
  { key: "poufsouffle",label: "Poufsouffle",icon: "fas fa-badger" },
  { key: "serpentard", label: "Serpentard", icon: "fas fa-snake" },
];

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ClassesApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "hp4-classes-app",
    classes: ["hp4-classes"],
    window: { title: "Classes de Poudlard", resizable: true },
    position: { width: 900, height: 650 },
  };

  static PARTS = {
    main: { template: "modules/gestion-harry-potter/templates/classes.hbs" },
  };

  static getClassData() {
    try {
      return game.settings.get(MODULE_ID, "classes-data") ?? {};
    } catch {
      return {};
    }
  }

  static async saveClassData(data) {
    await game.settings.set(MODULE_ID, "classes-data", data);
  }

  async _prepareContext() {
    const classData = ClassesApp.getClassData();
    const isGM = game.user.isGM;
   const actorNotes = getActorNotes();  // ← ajoute ça

    const years = YEARS.map((label, index) => {
      const yearKey = `year-${index + 1}`;

      // actors[houseKey] = tableau d'acteurs
      const actors = {};
      for (const house of HOUSES) {
        const storageKey = `${yearKey}-${house.key}`;
        const ids = classData[storageKey] ?? [];
        actors[house.key] = ids
          .map(id => game.actors.get(id))
          .filter(Boolean)
          .map(a => ({ id: a.id, name: a.name, img: a.img }));
      }

      return { label, yearKey, actors };
    });

      return { years, houses: HOUSES, isGM, actorNotes };
  }

  _onRender(context, options) {
    super._onRender(context, options);
// Notes
registerNoteModal(this);
    // Onglets par année
    const tabs = this.element.querySelectorAll(".hp4-year-tab");
    const panels = this.element.querySelectorAll(".hp4-year-panel");

    tabs[0]?.classList.add("active");
    panels[0]?.classList.add("active");

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        panels[i]?.classList.add("active");
      });
    });
// Clic sur un acteur → ouvre sa fiche (pour tous)
this.element.querySelectorAll(".hp4-actor-card img").forEach(img => {
  img.style.cursor = "pointer";
  img.addEventListener("click", (e) => {
    const card = e.currentTarget.closest(".hp4-actor-card");
    const actorId = card.dataset.id;
    const actor = game.actors.get(actorId);
    if (!actor) return;

    new ImagePopout(actor.img, {
      title: actor.name,
      shareable: true,
      uuid: actor.uuid
    }).render(true);
  });
});

    if (!game.user.isGM) return;
// Clic portrait → ImagePopout
this.element.querySelectorAll(".hp4-actor-card img").forEach(img => {
  img.style.cursor = "pointer";
  img.addEventListener("click", (e) => {
    const actorId = e.currentTarget.closest(".hp4-actor-card").dataset.id;
    const actor = game.actors.get(actorId);
    if (!actor) return;
    new ImagePopout(actor.img, {
      title: actor.name,
      shareable: true,
      uuid: actor.uuid
    }).render(true);
  });
});
    // Drag & drop sur chaque zone de maison
    this.element.querySelectorAll(".hp4-house-drop").forEach(zone => {
      zone.addEventListener("dragover", e => {
        e.preventDefault();
        zone.classList.add("drag-over");
      });

      zone.addEventListener("dragleave", () => {
        zone.classList.remove("drag-over");
      });

      zone.addEventListener("drop", async (e) => {
        e.preventDefault();
        zone.classList.remove("drag-over");

        let data;
        try { data = JSON.parse(e.dataTransfer.getData("text/plain")); }
        catch { return; }

        if (data.type !== "Actor") return;

        const actorId = data.uuid?.split(".").pop() ?? data.id;
        const yearKey = zone.dataset.year;
        const houseKey = zone.dataset.house;
        const storageKey = `${yearKey}-${houseKey}`;

        const classData = ClassesApp.getClassData();
        const list = classData[storageKey] ?? [];

        if (!list.includes(actorId)) {
          list.push(actorId);
          classData[storageKey] = list;
          await ClassesApp.saveClassData(classData);
          this.render();
        }
      });
    });

    // Boutons supprimer
    this.element.querySelectorAll(".hp4-remove-actor").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const { id: actorId, year: yearKey, house: houseKey } = e.currentTarget.dataset;
        const storageKey = `${yearKey}-${houseKey}`;
        const classData = ClassesApp.getClassData();
        classData[storageKey] = (classData[storageKey] ?? []).filter(id => id !== actorId);
        await ClassesApp.saveClassData(classData);
        this.render();
      });
    });
  }
}