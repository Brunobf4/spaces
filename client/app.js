import createToast from "./toast.js"; // Importa a função de toast

// Seleciona o formulário
const form = document.getElementById("new-user-form");
const listUsersButton = document.getElementById("list-users");
const searchButton = document.getElementById("search-button");
const searchEmailInput = document.getElementById("search-email");
const userListDiv = document.getElementById("user-list");

// Verifica se o formulário foi encontrado
if (form) {
  // Adiciona um evento de envio
  form.addEventListener("submit", async function (event) {
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
  });
} else {
  console.error("Formulário não encontrado!");
}

// Função para listar todos os usuários
listUsersButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/list-users");
    const users = await response.json();
    userListDiv.innerHTML = ""; // Limpa a lista anterior

    if (users.length === 0) {
      userListDiv.innerHTML = "<p>Nenhum usuário encontrado.</p>";
      createToast("Nenhum usuário encontrado.", "error"); // Exibe um toast se não houver usuários
    } else {
      users.forEach((user) => {
        const userItem = document.createElement("p");
        userItem.textContent = `Nome: ${user.name}, E-mail: ${user.email}`;
        userListDiv.appendChild(userItem);
      });
      createToast(`Foram encontrados ${users.length} usuários.`, "success"); // Exibe um toast com a quantidade de usuários encontrados
    }
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    createToast("Erro ao listar usuários. Tente novamente.", "error"); // Exibe um toast em caso de erro
  }
});

// Função para buscar usuário por e-mail
searchButton.addEventListener("click", async () => {
  const email = searchEmailInput.value;
  try {
    const response = await fetch(
      `/search-user?email=${encodeURIComponent(email)}`
    );
    const user = await response.json();
    userListDiv.innerHTML = ""; // Limpa a lista anterior
    if (user) {
      const userItem = document.createElement("p");
      userItem.textContent = `Nome: ${user.name}, E-mail: ${user.email}`;
      userListDiv.appendChild(userItem);
      createToast(
        `Usuário encontrado: ${user.name}, E-mail: ${user.email}`,
        "success"
      ); // Exibe um toast informando que o usuário foi encontrado
    } else {
      userListDiv.innerHTML =
        "<p>Nenhum usuário encontrado com esse e-mail.</p>";
      createToast("Nenhum usuário encontrado com esse e-mail.", "error"); // Exibe um toast se nenhum usuário for encontrado
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    createToast("Erro ao buscar usuário. Tente novamente.", "error"); // Exibe um toast em caso de erro
  }
});
//# sourceMappingURL=app.js.map
