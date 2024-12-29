import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import User from "./domain/User";
import jwt from "jsonwebtoken";
import { albumCovers, trackData } from "./data/data";

interface CustomRequest extends Request {
  user?: {
    // Exemplo de adicionar o usuário logado à requisição
    id: string;
    email: string;
  };
}

interface CustomResponse extends Response {
  user?: {
    // Exemplo de adicionar o usuário logado à requisição
    id: string;
    email: string;
  };
}

const JWT_SECRET = "your_jwt_secret"; // Substitua por um segredo seguro
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
const bodyParserLimit = "50mb";
app.use(express.json({ limit: bodyParserLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyParserLimit }));
app.use(express.static(path.resolve(__dirname, "../client"))); // Serve arquivos estáticos da pasta 'client'

// Responder com o arquivo principal (ex.: index.html)
app.get("/", (req: Request, res: Response) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline';"
  );
  res.sendFile(indexPath); // Corrigir para apontar para o arquivo correto
});

// Defina uma interface para estender o tipo Request
interface CustomRequest extends Request {
  user?: any; // Você pode definir um tipo mais específico aqui
}

interface CustomResponse extends Response {
  user?: any; // Você pode definir um tipo mais específico aqui
}

// Middleware para verificar JWT
function authenticateToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token não fornecido." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido." });
    req.user = user; // Salve o usuário decodificado na requisição
    next();
  });
}

app.post("/login", async (req: CustomRequest, res: CustomResponse) => {
  const { email, senha } = req.body;

  try {
    // Recupera o usuário pelo email
    const user = await User.getUserByEmail(email);
    if (!user || !(await User.verifyPassword(senha, user.senha))) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // Gera o token JWT
    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1h", // Expira em 1 hora
    });

    res.json({ token });
  } catch (error) {
    console.error("Erro ao autenticar:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Rota protegida
app.get("/protected", authenticateToken, (req: Request, res: Response) => {
  res.json({ message: "Acesso autorizado!", user: req.user });
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
app.get(
  "/list-users",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const users = await User.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res.status(500).json({ message: "Erro ao listar usuários." });
    }
  }
);

// Rota para buscar usuário por e-mail
app.get(
  "/search-user",
  authenticateToken,
  async (req: Request, res: Response) => {
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
  }
);

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

// Atualize as rotas para usar Router
const router = express.Router();

// Adicione o router ao app
app.use(router);

// Rota para atualizar perfil
app.post(
  "/update-profile",
  authenticateToken,
  async (req: CustomRequest, res: Response) => {
    const { type, newValue, currentPassword } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    try {
      let success = false;
      let message = "";

      switch (type) {
        case "name":
          success = await User.updateName(userEmail, newValue);
          message = "Nome atualizado com sucesso!";
          break;

        case "email":
          success = await User.updateEmail(userEmail, newValue);
          message = "Email atualizado com sucesso!";
          break;

        case "password":
          if (!currentPassword) {
            return res
              .status(400)
              .json({ message: "Senha atual é necessária." });
          }
          success = await User.updatePassword(
            userEmail,
            currentPassword,
            newValue
          );
          message = "Senha atualizada com sucesso!";
          break;

        default:
          return res
            .status(400)
            .json({ message: "Tipo de atualização inválido." });
      }

      if (success) {
        // Se for atualização de email, atualiza o token
        if (type === "email") {
          const token = jwt.sign({ email: newValue }, JWT_SECRET, {
            expiresIn: "1h",
          });
          return res.json({ message, token });
        }
        return res.json({ message });
      } else {
        return res.status(400).json({
          message:
            type === "password"
              ? "Senha atual incorreta."
              : "Não foi possível atualizar o perfil.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      res.status(500).json({ message: "Erro interno ao atualizar perfil." });
    }
  }
);

// Rota para criar um novo post
app.post(
  "/create-post",
  authenticateToken,
  async (req: CustomRequest, res: Response) => {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const { title, content, mediaType, mediaData } = req.body;

    try {
      // Validação básica
      if (!title || !mediaType) {
        return res
          .status(400)
          .json({ message: "Título e tipo de mídia são obrigatórios." });
      }

      // Validação do tamanho do base64 (agora 50MB)
      if (
        mediaData &&
        Buffer.from(mediaData, "base64").length > 50 * 1024 * 1024
      ) {
        return res
          .status(400)
          .json({ message: "Arquivo muito grande. Limite de 50MB." });
      }

      const post = await User.createPost(userEmail, {
        title,
        content,
        mediaType,
        mediaData,
      });

      res.status(201).json({
        message: "Post criado com sucesso!",
        post: {
          ...post,
          mediaData: mediaData ? "[MEDIA]" : null,
        },
      });
    } catch (error) {
      console.error("Erro ao criar post:", error);
      res.status(500).json({ message: "Erro interno ao criar post." });
    }
  }
);

// Rota para buscar posts do usuário
app.get(
  "/user-posts",
  authenticateToken,
  async (req: CustomRequest, res: Response) => {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    try {
      const posts = await User.getUserPosts(userEmail);
      res.json(
        posts.map((post) => ({
          ...post,
          mediaData: post.mediaData ? "dados em base64..." : null, // Não retorna os dados completos na listagem
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      res.status(500).json({ message: "Erro ao buscar posts." });
    }
  }
);

// Rota para buscar todos os posts
app.get(
  "/posts",
  authenticateToken,
  async (req: CustomRequest, res: Response) => {
    try {
      const posts = await User.getAllPosts();
      res.json(
        posts.map((post) => ({
          ...post,
          mediaData: post.mediaData ? "dados em base64..." : null, // Não retorna os dados completos na listagem
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      res.status(500).json({ message: "Erro ao buscar posts." });
    }
  }
);

// Adicione no início do arquivo, após as importações
await User.initializeTables();

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://127.0.0.1:${port}`);
});
