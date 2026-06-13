import { MODULE_ID } from "../constants.js";
import { GestionHarryPotterApp } from "../apps/mainApp.js";

export function registerSidebar() {
  // En Foundry v14, les onglets sidebar sont dans #sidebar > .tabs
  Hooks.on("renderSidebar", () => {
    // Évite les doublons si re-render
    if (document.querySelector(".hp4-sidebar-tab")) return;

    const tabsEl = document.querySelector("#sidebar .tabs");
    if (!tabsEl) {
      console.warn(`[${MODULE_ID}] Sidebar tabs not found`);
      return;
    }

    // Crée un onglet comme les autres (même structure que Foundry)
    const tab = document.createElement("a");
    tab.className = "item hp4-sidebar-tab";
    tab.dataset.tab = "hp4-gestion";
    tab.dataset.tooltip = "Gestion Harry Potter";
    tab.innerHTML = `<i class="fas fa-chalkboard"></i>`;

    tabsEl.appendChild(tab);

    tab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      new GestionHarryPotterApp().render(true);
    });
  });
}