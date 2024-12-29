import { updateSectionsVisibility } from "../app.js";
import createToast from "../toast.js";

class LoginHandler {
  constructor(buttonId) {
    this.button = document.getElementById(buttonId);
    if (this.button) {
      this.button.addEventListener("click", this.handleLogin.bind(this));
    } else {
      console.error("Botão de login não encontrado!");
    }
  }
  async checkAuthToken() {
    if (authToken) {
      updateSectionsVisibility(true);
      // Optionally, you can also fetch user information here using the token
      // and update the UI with that information if necessary
      console.log("User logged in with existing token");
    }
  }

  async handleLogin(event) {
    event.preventDefault(); // Impede o recarregamento da página

    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      updateSectionsVisibility(true);
      return;
    }
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        createToast("Login realizado com sucesso!", "success");
        updateSectionsVisibility(true);
      } else {
        createToast(data.message || "Erro ao fazer login", "error");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      createToast("Erro ao fazer login. Tente novamente.", "error");
    }
  }
}

class RegisterHandler {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (this.form) {
      this.form.addEventListener("submit", this.handleRegister.bind(this));
    } else {
      console.error("Formulário de registro não encontrado!");
    }
  }

  async handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const senha = document.getElementById("register-senha").value;

    // Validação dos campos
    if (!name || !email || !senha) {
      createToast("Todos os campos são obrigatórios!", "error");
      return;
    }

    try {
      const response = await fetch("/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        createToast(
          "Registro realizado com sucesso! Faça login para continuar.",
          "success"
        );

        // Limpa o formulário
        this.form.reset();

        // Mostra a seção de login
        document.getElementById("register-section").style.display = "none";
        document.getElementById("login-section").style.display = "block";
      } else {
        createToast(data.message || "Erro ao registrar", "error");
      }
    } catch (error) {
      console.error("Erro ao registrar:", error);
      createToast("Erro ao registrar. Tente novamente.", "error");
    }
  }
}

class ProfileHandler {
  constructor() {
    this.modal = document.getElementById("edit-profile-modal");
    this.form = document.getElementById("edit-profile-form");
    this.modalTitle = document.getElementById("modal-title");
    this.modalContent = document.getElementById("modal-content");

    // Botões do menu
    document
      .getElementById("change-name-btn")
      .addEventListener("click", () => this.showEditModal("name"));
    document
      .getElementById("change-email-btn")
      .addEventListener("click", () => this.showEditModal("email"));
    document
      .getElementById("change-password-btn")
      .addEventListener("click", () => this.showEditModal("password"));
    document
      .getElementById("logout-btn")
      .addEventListener("click", this.handleLogout.bind(this));

    // Botões do modal
    document
      .getElementById("modal-cancel")
      .addEventListener("click", () => this.hideModal());
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
  }

  showEditModal(type) {
    this.currentEditType = type;
    let content = "";

    switch (type) {
      case "name":
        this.modalTitle.textContent = "Alterar Nome";
        content = `
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Novo Nome:</label>
            <input type="text" name="newValue" required class="border border-gray-300 rounded-md p-2 w-full" />
          </div>
        `;
        break;
      case "email":
        this.modalTitle.textContent = "Alterar Email";
        content = `
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Novo Email:</label>
            <input type="email" name="newValue" required class="border border-gray-300 rounded-md p-2 w-full" />
          </div>
        `;
        break;
      case "password":
        this.modalTitle.textContent = "Alterar Senha";
        content = `
          <div class="space-y-3">
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-2">Senha Atual:</label>
              <input type="password" name="currentPassword" required class="border border-gray-300 rounded-md p-2 w-full" />
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-2">Nova Senha:</label>
              <input type="password" name="newValue" required class="border border-gray-300 rounded-md p-2 w-full" />
            </div>
          </div>
        `;
        break;
    }

    this.modalContent.innerHTML = content;
    this.modal.classList.remove("hidden");
  }

  hideModal() {
    this.modal.classList.add("hidden");
    this.form.reset();
  }

  async handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(this.form);
    const newValue = formData.get("newValue");
    const currentPassword = formData.get("currentPassword");

    try {
      const response = await fetch(`/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          type: this.currentEditType,
          newValue,
          currentPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        createToast("Perfil atualizado com sucesso!", "success");
        this.hideModal();
        if (this.currentEditType === "name") {
          document.getElementById("nav-user-name").textContent = newValue;
        }
      } else {
        createToast(data.message || "Erro ao atualizar perfil", "error");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      createToast("Erro ao atualizar perfil. Tente novamente.", "error");
    }
  }

  handleLogout() {
    localStorage.removeItem("authToken");
    document.getElementById("main-nav").style.display = "none";
    document.getElementById("main-content").style.display = "none";
    document.getElementById("login-section").style.display = "block";
    createToast("Deslogado com sucesso!", "success");
  }
}

export { LoginHandler, RegisterHandler, ProfileHandler };
