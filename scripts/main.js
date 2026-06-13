/* globals Hooks, game */

import { MODULE_ID } from "./constants.js";
import { registerSidebar } from "./sidebar/sidebar.js";

Hooks.once("init", function () {
  game.settings.register(MODULE_ID, "debug", {
    name: "Debug",
    hint: "Active le mode debug du module.",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  // Setting optionnel de secours
  game.settings.register(MODULE_ID, "auto-open", {
    name: "Auto-ouvrir",
    hint: "Ouvre le panneau de gestion au chargement (GM uniquement).",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
});

Hooks.once("ready", function () {
  if (!game.user?.isGM) return;
  console.debug(`[${MODULE_ID}] Module loaded`);
  registerSidebar();

  const autoOpen = game.settings.get(MODULE_ID, "auto-open") ?? false;
  if (autoOpen) {
    // Import dynamique pour éviter d'importer inutilement au boot
    import("./apps/mainApp.js").then(({ GestionHarryPotterApp }) => {
      new GestionHarryPotterApp().render(true);
    });
  }
});


