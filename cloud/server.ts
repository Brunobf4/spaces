import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import User from "./domain/User";

// Criando o app e definindo a porta
const app = express();
const port = 8080;

// Obter o diretório atual corretamente em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho correto para o arquivo 'index.html' na pasta 'client'
const indexPath = path.resolve(__dirname, "../client/index.html"); // Ajuste aqui para apontar para o arquivo correto

// Servir arquivos estáticos da pasta 'client'

// Servir arquivos estáticos da pasta 'client'
app.use(express.json()); // Para analisar JSON
app.use(express.urlencoded({ extended: true })); // Para dados de formulários
app.use(express.static(path.resolve(__dirname, "../client"))); // Serve arquivos estáticos da pasta 'client'

// Responder com o arquivo principal (ex.: index.html)
app.get("/", (req: Request, res: Response) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline';"
  );
  res.sendFile(indexPath); // Corrigir para apontar para o arquivo correto
});

// Rota para criar um novo usuário
app.post("/create-user", async (req: Request, res: Response) => {
  const { name, email, senha } = req.body;
  console.log(req.body);
  try {
    const newUser = await User.createUser({ name, email, senha });
    res
      .status(201)
      .json({ message: `Usuário ${newUser.name} criado com sucesso!` });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ message: "Erro ao criar usuário." });
  }
});

// Rota para listar todos os usuários
app.get("/list-users", async (req: Request, res: Response) => {
  try {
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ message: "Erro ao listar usuários." });
  }
});

// Rota para buscar usuário por e-mail
app.get("/search-user", async (req: Request, res: Response) => {
  const { email } = req.query;
  try {
    const user = await User.getUserByEmail(email as string);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "Usuário não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ message: "Erro ao buscar usuário." });
  }
});

const albumCovers = [
  {
    image: "/assets/Believing.png",
    title: "Believing",
    trackId: "1f774147-57ca-4841-9255-9f4b662212b4",
  },
  {
    image: "/assets/saysomething.png",
    title: "Say Something",
    trackId: "d417d585-0627-4056-a6bd-5a22cf4df8a8",
  },
  {
    image: "/assets/therushpatience.jpg",
    title: "A Rush Patience",
    trackId: "32d1d60d-1c1c-4e91-a133-c3305890b4ff",
  },
  {
    image: "/assets/thekinginlove.jpg",
    title: "The Mood of a King in Love",
    trackId: "5e394eac-3ee3-4eff-8bbb-f4f67402785b",
  },
  {
    image: "/assets/the-times-fly.jpg",
    title: "The Times Fly",
    trackId: "174f15a5-4281-44c6-9301-59d19fd546f7",
  },
  {
    image: "/assets/for-ever-girl.jpg",
    title: "For Ever Girl",
    trackId: "e1408cd1-23cd-4267-974f-7d3e2cfa45a8",
  },
  {
    image: "/assets/maybe-i-too-seriues.jpg",
    title: "Maybe I Too Seriues",
    trackId: "9dd62c31-9001-41d2-8d7d-102bc89ba68e",
  },
];

app.get(
  "/search-track",
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const tracksWithAlbums = trackData.map((track) => {
        const album = albumCovers.find((a) => a.trackId === track.id);

        return {
          ...track,
          album_name: album?.title || "Título não disponível",
          album_image: album?.image || "placeholder.jpg",
        };
      });
      res.status(200).json({ tracks: tracksWithAlbums });
    } catch (error) {
      console.error("Erro ao buscar tracks:", error);
      res.status(500).json({ message: "Erro interno ao buscar tracks." });
    }
  }
);

const trackData = [
  {
    id: "1f774147-57ca-4841-9255-9f4b662212b4",
    spotify_id: "63GBIDrogARnQ1JE5D9nSn",
    name: "Believing",
    album_id: "2NAuxv3lMDDQP3pBQxmVbi",
    album_name: "Believing",
    artist_ids: ["57rKIPRIs4yfiXdWDQILa3"],
    artist_names: ["Pedraça"],
    duration_ms: 101034,
    popularity: 0,
    preview_url:
      "https://p.scdn.co/mp3-preview/062255290de01fba68c0b444d74f9ee4595f06f5?cid=d8a5ed958d274c2e8ee717e6a4b0971d",
    youtube_url:
      "https://www.youtube.com/watch?v=P_O3QNw6wPM&list=OLAK5uy_nFdTLYQQqw500LgMe4QURRHOQljjuhjDg",
    release_date: "2024-09-21",
  },

  {
    id: "d417d585-0627-4056-a6bd-5a22cf4df8a8",
    spotify_id: "4tVwobV99G7V5JbscMcTKm",
    name: "Say Something",
    album_id: "2PnutonwORkh1L82vmnyXZ",
    album_name: "A Rush Patience",
    artist_ids: ["57rKIPRIs4yfiXdWDQILa3"],
    artist_names: ["Pedraça"],
    duration_ms: 86671,
    popularity: 0,
    preview_url:
      "https://p.scdn.co/mp3-preview/c3dfdad503c92df3322de1e4b397b61d4ad4a548?cid=d8a5ed958d274c2e8ee717e6a4b0971d",
    youtube_url:
      "https://www.youtube.com/watch?v=AdV0ChOMG0Q&list=OLAK5uy_mCckyhKp4VpDwtLmX3xurA60wdkGvtQxE",
    release_date: "2024-07-13",
  },
  {
    id: "32d1d60d-1c1c-4e91-a133-c3305890b4ff",
    spotify_id: "4tVwobV99G7V5JbscMcTKm",
    name: "A Rush Patience",
    album_id: "2PnutonwORkh1L82vmnyXZ",
    album_name: "A Rush Patience",
    artist_ids: ["57rKIPRIs4yfiXdWDQILa3"],
    artist_names: ["Pedraça"],
    duration_ms: 96000,
    popularity: 0,
    preview_url:
      "https://p.scdn.co/mp3-preview/01976ac4d8bb34883bd4e39e0b677849001623bd?cid=d8a5ed958d274c2e8ee717e6a4b0971d",
    youtube_url:
      "https://www.youtube.com/watch?v=jr4ZPMhLFIk&list=OLAK5uy_mpKt9jx7umfPI7CifilY44RVpjxzMbB4k",
    release_date: "2024-07-13",
  },
  {
    id: "5e394eac-3ee3-4eff-8bbb-f4f67402785b",
    spotify_id: "1xT0JJOsuX67haayuPi3Wq",
    name: "The Mood of a King in Love",
    album_id: "3E1MjOrFUf2ovMKAXZMUZq",
    album_name: "The Mood of a King in Love",
    artist_ids: ["57rKIPRIs4yfiXdWDQILa3"],
    artist_names: ["Pedraça"],
    duration_ms: 67000,
    popularity: 0,
    preview_url:
      "https://p.scdn.co/mp3-preview/363f1cd0c4761735bdd07de67219b2653386b659?cid=d8a5ed958d274c2e8ee717e6a4b0971d",
    youtube_url:
      "https://www.youtube.com/watch?v=xqvobS29HIQ&list=OLAK5uy_mg95dLkz_GM-syb9rxD9tdF-LwNaBSlM8",
    release_date: "2024-06-12",
  },
  {
    id: "174f15a5-4281-44c6-9301-59d19fd546f7",
    spotify_id: "5F4uDMQaHz4UOwzpFl7VQI",
    name: "The Times Fly",
    album_id: "6La0Ildi05qFT431Hl48bV",
    album_name: "The Times Fly",
    artist_ids: ["57rKIPRIs4yfiXdWDQILa3"],
    artist_names: ["Pedraça"],
    duration_ms: 72005,
    popularity: 0,
    preview_url:
      "https://p.scdn.co/mp3-preview/a560c420e8e12eda4a8b7d9fa4a569fa9388578d?cid=d8a5ed958d274c2e8ee717e6a4b0971d",
    youtube_url:
      "https://www.youtube.com/watch?v=JJj4pI3fsGk&list=OLAK5uy_nZWbg5MqXrYbnTcRXkIQqvwlfoDn0IU78",
    release_date: "2024-05-31",
  },
  {
    id: "e1408cd1-23cd-4267-974f-7d3e2cfa45a8",
    spotify_id: "4tVwobV99G7V5JbscMcTKm",
    name: "For Ever Girl",
    album_id: "2PnutonwORkh1L82vmnyXZ",
    album_name: "For Ever Girl",
    artist_ids: ["57rKIPRIs4yfiXdWDQILa3"],
    artist_names: ["Pedraça"],
    duration_ms: 65457,
    popularity: 0,
    preview_url:
      "https://p.scdn.co/mp3-preview/6c757ce3265e7313b42718659d96ccb3ed05c50f?cid=d8a5ed958d274c2e8ee717e6a4b0971d",
    youtube_url:
      "https://www.youtube.com/watch?v=_dEzIaudz3E&list=OLAK5uy_kkaWHahiJ-ggtmCvo7FA7p2e5su5SwlLQ",
    release_date: "2024-05-24",
  },
  {
    id: "9dd62c31-9001-41d2-8d7d-102bc89ba68e",
    spotify_id: "4vdbAppvHoD4vryWap40nF",
    name: "Maybe I Too Seriues",
    album_id: "2PnutonwORkh1L82vmnyXZ",
    album_name: "Maybe I Too Seriues",
    artist_ids: ["57rKIPRIs4yfiXdWDQILa3"],
    artist_names: ["Pedraça"],
    duration_ms: 96000,
    popularity: 0,
    preview_url:
      "https://p.scdn.co/mp3-preview/abdbf8e5adb8f38681c5859fe8dab405b02635c0?cid=d8a5ed958d274c2e8ee717e6a4b0971d",
    youtube_url:
      "https://www.youtube.com/watch?v=-bsH5VwF_3E&list=OLAK5uy_nDF8ncssJMwrwRoLhRapqzj-07dP8pKmY",
    release_date: "2024-07-13",
  }, // Adicionar os outros dados de faixas aqui...
];

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://127.0.0.1:${port}`);
});
