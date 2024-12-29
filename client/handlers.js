// toast.js
import createToast from "./toast.js"; // Importa a função de toast

// 1. Classe para tratar o envio do formulário
class FormHandler {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit.bind(this));
    } else {
      console.error("Formulário não encontrado!");
    }
  }
  async handleSubmit(event) {
    event.preventDefault(); // Impede o recarregamento da página

    // Captura os dados do formulário
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    // Envia os dados para o servidor
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
        createToast(data.message, "success"); // Exibe um toast de sucesso
      } else {
        createToast(data.message, "error"); // Exibe um toast de erro
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      createToast("Erro ao criar usuário. Tente novamente.", "error"); // Exibe um toast de erro
    }
  }
}

// 2. Classe para listar usuários
class ListUsersHandler {
  constructor(listUsersButtonId, userListDivId) {
    this.listUsersButton = document.getElementById(listUsersButtonId);
    this.userListDiv = document.getElementById(userListDivId);
    this.listUsersButton.addEventListener(
      "click",
      this.handleListUsers.bind(this)
    );
  }
  async handleListUsers() {
    try {
      const response = await fetch("/list-users");
      const users = await response.json();
      this.userListDiv.innerHTML = ""; // Limpa a lista anterior

      if (users.length === 0) {
        this.userListDiv.innerHTML = "<p>Nenhum usuário encontrado.</p>";
        createToast("Nenhum usuário encontrado.", "error"); // Exibe um toast se não houver usuários
      } else {
        users.forEach((user) => {
          const userItem = document.createElement("p");
          userItem.textContent = `Nome: ${user.name}, E-mail: ${user.email}`;
          this.userListDiv.appendChild(userItem);
        });
        createToast(`Foram encontrados ${users.length} usuários.`, "success"); // Exibe um toast com a quantidade de usuários encontrados
      }
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      createToast("Erro ao listar usuários. Tente novamente.", "error"); // Exibe um toast em caso de erro
    }
  }
}

// 3. Classe para buscar usuário
class SearchUserHandler {
  constructor(searchButtonId, searchEmailInputId, userListDivId) {
    this.searchButton = document.getElementById(searchButtonId);
    this.searchEmailInput = document.getElementById(searchEmailInputId);
    this.userListDiv = document.getElementById(userListDivId);

    this.searchButton.addEventListener("click", this.handleSearch.bind(this));
  }

  async handleSearch() {
    const email = this.searchEmailInput.value;
    try {
      const response = await fetch(
        `/search-user?email=${encodeURIComponent(email)}`
      );
      const user = await response.json();
      this.userListDiv.innerHTML = ""; // Limpa a lista anterior

      if (user) {
        const userItem = document.createElement("p");
        userItem.textContent = `Nome: ${user.name}, E-mail: ${user.email}`;
        this.userListDiv.appendChild(userItem);
        createToast(
          `Usuário encontrado: ${user.name}, E-mail: ${user.email}`,
          "success"
        );
      } else {
        this.userListDiv.innerHTML =
          "<p>Nenhum usuário encontrado com esse e-mail.</p>";
        createToast("Nenhum usuário encontrado com esse e-mail.", "error");
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      createToast("Erro ao buscar usuário. Tente novamente.", "error");
    }
  }
}

export { FormHandler, ListUsersHandler, SearchUserHandler };
