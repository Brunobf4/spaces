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

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://127.0.0.1:${port}`);
});
