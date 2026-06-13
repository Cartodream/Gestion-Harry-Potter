import { MODULE_ID } from "../constants.js";

const YEARS = [
  "1ère année", "2ème année", "3ème année", "4ème année",
  "5ème année", "6ème année", "7ème année"
];

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ClassesApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "hp4-classes-app",
    classes: ["hp4-classes"],
    window: { title: "Classes de Poudlard", resizable: true },
    position: { width: 800, height: 600 },
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

    const years = YEARS.map((label, index) => {
      const yearKey = `year-${index + 1}`;
      const actorIds = classData[yearKey] ?? [];
      const actors = actorIds
        .map(id => game.actors.get(id))
        .filter(Boolean)
        .map(a => ({ id: a.id, name: a.name, img: a.img }));

      return { label, yearKey, actors };
    });

    return { years, isGM };
  }

  _onRender(context, options) {
    super._onRender(context, options);

    // Gestion des onglets
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

    if (!game.user.isGM) return;

    // Drag & drop et suppression (GM uniquement)
    this.element.querySelectorAll(".hp4-year-drop").forEach(zone => {
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
        const classData = ClassesApp.getClassData();
        const list = classData[yearKey] ?? [];

        if (!list.includes(actorId)) {
          list.push(actorId);
          classData[yearKey] = list;
          await ClassesApp.saveClassData(classData);
          this.render();
        }
      });

      zone.querySelectorAll(".hp4-remove-actor").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const actorId = e.currentTarget.dataset.id;
          const yearKey = zone.dataset.year;
          const classData = ClassesApp.getClassData();
          classData[yearKey] = (classData[yearKey] ?? []).filter(id => id !== actorId);
          await ClassesApp.saveClassData(classData);
          this.render();
        });
      });
    });
  }
}