// toast.js
import createToast from "./toast.js"; // Importa a função de toast
import { updateSectionsVisibility } from "./app.js";

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

// Atualiza o LoginHandler para usar a nova função

// Adicione a nova classe ProfileHandler

// Adicione a nova classe PostHandler
class PostHandler {
  constructor(formId, postsContainerId) {
    this.form = document.getElementById(formId);
    this.postsContainer = document.getElementById(postsContainerId);
    this.modal = document.getElementById("post-modal");

    // Botões do modal
    document
      .getElementById("create-post-btn")
      .addEventListener("click", () => this.showModal());
    document
      .getElementById("close-post-modal")
      .addEventListener("click", () => this.hideModal());
    document
      .getElementById("cancel-post")
      .addEventListener("click", () => this.hideModal());

    // Fecha o modal se clicar fora dele
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });

    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit.bind(this));
    }

    // Carrega os posts ao inicializar
    this.loadPosts();

    // Adicione constantes para limites
    this.MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB em bytes
    this.PREVIEW_CONTAINER_ID = "media-preview";

    // Adicione listener para preview de mídia
    document
      .getElementById("post-media")
      .addEventListener("change", this.handleFileSelect.bind(this));
  }

  showModal() {
    this.modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Previne rolagem do body
  }

  hideModal() {
    this.modal.classList.add("hidden");
    this.form.reset();
    document.body.style.overflow = ""; // Restaura rolagem do body
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Verifica o tamanho do arquivo
    if (file.size > this.MAX_FILE_SIZE) {
      createToast(
        `Arquivo muito grande. Limite de ${
          this.MAX_FILE_SIZE / 1024 / 1024
        }MB.`,
        "error"
      );
      event.target.value = ""; // Limpa a seleção
      return;
    }

    // Lista de tipos MIME permitidos
    const allowedTypes = {
      audio: [
        "audio/mpeg", // MP3
        "audio/wav", // WAV
        "audio/ogg", // OGG
        "audio/flac", // FLAC
        "audio/aac", // AAC
        "audio/mp4", // M4A
        "audio/webm", // WEBM
      ],
      video: ["video/mp4", "video/webm", "video/ogg"],
      image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    };

    // Verifica o tipo do arquivo
    const fileType = file.type.split("/")[0];
    const mimeType = file.type;

    if (!["audio", "video", "image"].includes(fileType)) {
      createToast("Tipo de arquivo não suportado.", "error");
      event.target.value = "";
      return;
    }

    // Verifica se o tipo MIME específico é permitido
    if (!allowedTypes[fileType].includes(mimeType)) {
      createToast(
        `Formato de ${fileType} não suportado. Formatos suportados: ${allowedTypes[
          fileType
        ].join(", ")}`,
        "error"
      );
      event.target.value = "";
      return;
    }

    // Adiciona informação sobre o arquivo selecionado
    const fileInfo = document.createElement("div");
    fileInfo.className = "text-sm text-gray-600 mt-2";
    fileInfo.textContent = `Arquivo selecionado: ${file.name} (${(
      file.size /
      1024 /
      1024
    ).toFixed(2)}MB)`;

    const mediaInput = document.getElementById("post-media");
    const existingInfo = mediaInput.parentElement.querySelector(".text-sm");
    if (existingInfo) {
      existingInfo.remove();
    }
    mediaInput.parentElement.appendChild(fileInfo);
  }

  async handleSubmit(event) {
    event.preventDefault();

    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;
    const mediaFile = document.getElementById("post-media").files[0];

    try {
      let mediaData = null;
      let mediaType = "text";

      if (mediaFile) {
        // Verifica novamente o tamanho do arquivo
        if (mediaFile.size > this.MAX_FILE_SIZE) {
          createToast(
            `Arquivo muito grande. Limite de ${
              this.MAX_FILE_SIZE / 1024 / 1024
            }MB.`,
            "error"
          );
          return;
        }

        try {
          mediaData = await this.convertFileToBase64(mediaFile);
          mediaType = mediaFile.type.startsWith("audio")
            ? "audio"
            : mediaFile.type.startsWith("video")
            ? "video"
            : mediaFile.type.startsWith("image")
            ? "mixed"
            : "text";
        } catch (error) {
          console.error("Erro ao processar arquivo:", error);
          createToast("Erro ao processar arquivo. Tente novamente.", "error");
          return;
        }
      }

      const response = await fetch("/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          title,
          content,
          mediaType,
          mediaData,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.message || "Erro ao criar post");
        } else {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      createToast("Post criado com sucesso!", "success");
      this.hideModal();
      await this.loadPosts();
    } catch (error) {
      console.error("Erro ao criar post:", error);
      createToast(error.message || "Erro ao criar post", "error");
    }
  }

  convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async loadPosts() {
    try {
      const response = await fetch("/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const posts = await response.json();
        this.renderPosts(posts);
      } else {
        console.error("Erro ao carregar posts");
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  }

  renderPosts(posts) {
    this.postsContainer.innerHTML = posts
      .map(
        (post) => `
      <article class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <h3 class="text-xl font-semibold mb-2">${post.title}</h3>
        <p class="text-gray-600 mb-2">${post.content || ""}</p>
        ${this.renderMedia(post)}
        <div class="text-sm text-gray-500 mt-2">
          Por ${post.author_name} em ${new Date(
          post.created_at
        ).toLocaleString()}
        </div>
        <div class="text-sm text-gray-700 mt-2">
          <strong>Comentário do Modelo:</strong> ${
            post.model_comment || "Nenhum comentário disponível."
          }
        </div>
      </article>
    `
      )
      .join("");
  }

  renderMedia(post) {
    if (!post.media_data) return "";

    switch (post.media_type) {
      case "audio":
        // Detecta o tipo de áudio baseado no início do base64
        const audioData = atob(post.media_data.slice(0, 8)); // Pega os primeiros bytes
        let audioType = "mpeg"; // Padrão para MP3

        // Detecta o tipo de áudio pelos primeiros bytes
        if (audioData.startsWith("ID3")) {
          audioType = "mpeg"; // MP3
        } else if (audioData.startsWith("RIFF")) {
          audioType = "wav"; // WAV
        } else if (audioData.startsWith("OggS")) {
          audioType = "ogg"; // OGG
        } else if (audioData.startsWith("fLaC")) {
          audioType = "flac"; // FLAC
        }

        return `
          <div class="audio-player w-full mt-2 bg-gray-100 p-4 rounded-lg">
            <audio 
              controls 
              class="w-full" 
              src="data:audio/${audioType};base64,${post.media_data}"
            >
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        `;

      case "video":
        return `
          <div class="video-player w-full mt-2">
            <video 
              controls 
              class="w-full rounded-lg" 
              src="data:video/mp4;base64,${post.media_data}"
            >
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        `;

      case "mixed":
        return `
          <div class="image-container mt-2">
            <img 
              src="data:image/jpeg;base64,${post.media_data}" 
              alt="Post media" 
              class="w-full rounded-lg"
              loading="lazy"
            />
          </div>
        `;

      default:
        return "";
    }
  }
}

// Exporte a nova classe junto com as outras
export { FormHandler, ListUsersHandler, SearchUserHandler, PostHandler };
