import { MODULE_ID } from "../constants.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class GestionHarryPotterApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "gestion-harry-potter-app",
    classes: ["hp4-main"],
    window: {
      title: "Gestion Harry Potter",
      resizable: true,
    },
    position: {
      width: 700,
      height: "auto",
    },
  };

  static PARTS = {
    main: {
      template: "modules/gestion-harry-potter/templates/main.hbs",
    },
  };

  async _prepareContext() {
    return {
      moduleId: MODULE_ID,
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);

    this.element.querySelector("[data-action='open-classes']")
      ?.addEventListener("click", () => {});
    this.element.querySelector("[data-action='open-timetable']")
      ?.addEventListener("click", () => {});
    this.element.querySelector("[data-action='open-npcs']")
      ?.addEventListener("click", () => {});
    this.element.querySelector("[data-action='open-house-cup']")
      ?.addEventListener("click", () => {});
  }
}