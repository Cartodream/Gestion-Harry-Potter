import { MODULE_ID } from "../constants.js";
import { GestionHarryPotterApp } from "../apps/mainApp.js";

export function registerSidebar() {
  try {
    const sidebarEl = document.querySelector("#sidebar");
    if (!sidebarEl) {
      console.warn(`[${MODULE_ID}] #sidebar not found`);
      return;
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hp4-sidebar-btn";
    btn.innerHTML = `<i class="fas fa-chalkboard"></i><span>Gestion</span>`;
    btn.dataset.action = "open-hp4";

    sidebarEl.appendChild(btn);

    btn.addEventListener("click", () => {
      new GestionHarryPotterApp().render(true);
    });
  } catch (e) {
    console.error(`[${MODULE_ID}] Failed to register sidebar button`, e);
  }
}