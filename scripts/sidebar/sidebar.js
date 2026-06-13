import { MODULE_ID } from "../constants.js";
import { GestionHarryPotterApp } from "../apps/mainApp.js";

export function registerSidebar() {
  // Foundry v14: sidebar uses ApplicationShell / left sidebar. We add a custom button.
  Hooks.once("setup", () => {
    try {
      const shell = ui?.sidebar;
      if (!shell?.element) {
        console.warn(`[${MODULE_ID}] ui.sidebar not found`);
        return;
      }

      // Create a button in the top-level sidebar
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hp4-sidebar-btn";
      btn.innerHTML = `<i class="fas fa-chalkboard"></i><span>Gestion</span>`;
      btn.dataset.action = "open-hp4";

      shell.element.appendChild(btn);

      btn.addEventListener("click", () => {
        new GestionHarryPotterApp().render(true);
      });
    } catch (e) {
      console.error(`[${MODULE_ID}] Failed to register sidebar button`, e);
    }
  });
}

