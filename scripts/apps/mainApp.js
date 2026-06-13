import { MODULE_ID } from "../constants.js";

export class GestionHarryPotterApp extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "gestion-harry-potter-app",
      classes: ["hp4-main"],
      title: "Gestion Harry Potter",
      template: "modules/gestion-harry-potter/templates/main.hbs",
      width: 700,
      height: "auto",
      resizable: true,
      tabs: []
    });
  }

  getData() {
    return {
      moduleId: MODULE_ID
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-action='open-classes']").on("click", () => {});
    html.find("[data-action='open-timetable']").on("click", () => {});
    html.find("[data-action='open-npcs']").on("click", () => {});
    html.find("[data-action='open-house-cup']").on("click", () => {});
  }
}

