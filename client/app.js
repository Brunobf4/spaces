import { LoginHandler, ProfileHandler, RegisterHandler } from "./auth/auth.js";
import { FormHandler, PostHandler } from "./handlers.js";
import createToast from "./toast.js";

// Cria instâncias das classes de tratamento
const loginHandler = new LoginHandler("login-button");
const registerHandler = new RegisterHandler("register-form");
const formHandler = new FormHandler("new-user-form");

// Função para gerenciar a visibilidade das seções
export function updateSectionsVisibility(isLoggedIn) {
  if (isLoggedIn) {
    const profileHandler = new ProfileHandler();
    const postHandler = new PostHandler("post-form", "posts-container");
  }

  const sections = {
    "login-section": !isLoggedIn,
    "register-section": false, // Sempre começa oculto
    "main-content": isLoggedIn,
    "main-nav": isLoggedIn,
  };

  Object.entries(sections).forEach(([id, shouldShow]) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = shouldShow ? "block" : "none";
    }
  });
}

// Verifica se já existe um token de autenticação
const authToken = localStorage.getItem("authToken");
updateSectionsVisibility(!!authToken);

function toggleButtonState(clickedButton, buttonGroupSelector) {
  const buttons = document.querySelectorAll(buttonGroupSelector);

  buttons.forEach((button) => {
    if (button === clickedButton) {
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      button.removeAttribute("disabled");
    } else {
      button.classList.remove("active");
      button.setAttribute("aria-selected", "false");
      button.setAttribute("disabled", "disabled");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("main-nav");
  const navLinks = nav.querySelectorAll(".nav-link");
  const profileDropdown = document.getElementById("profile-dropdown");
  const profileLinks = profileDropdown.querySelectorAll("ul a");

  navLinks.forEach((navLink) => {
    navLink.addEventListener("click", (event) => {
      event.preventDefault();
      toggleButtonState(event.target, "#main-nav .nav-link");
      // Handle the navigation or function for the selected option
    });
  });

  profileDropdown.addEventListener("toggle", (event) => {
    if (event.target.open) {
      // Dropdown is opened
      profileDropdown.querySelector("ul").classList.remove("hidden");
    } else {
      // Dropdown is closed
      profileDropdown.querySelector("ul").classList.add("hidden");
    }
  });

  profileLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      profileDropdown.removeAttribute("open");
      profileDropdown.querySelector("ul").classList.add("hidden");

      // Handle the navigation or function for the selected option
    });
  });
});

// Atualiza o logout para usar a nova função
document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  updateSectionsVisibility(false);
  createToast("Logout realizado com sucesso!", "success");
});
