import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import User from "./user.js";

const app = express();
const port = 8080;

// Obter o diretório atual corretamente em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho correto para a pasta 'client' (apenas uma vez)
const distPath = path.resolve(__dirname); // Caminho ajustado

// Servir arquivos estáticos da pasta 'client'
app.use(express.json()); // Para analisar JSON
app.use(express.urlencoded({ extended: true })); // Para dados de formulários
app.use(express.static(distPath));

// Responder com o arquivo principal (ex.: index.html)
app.get("/", (req, res) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline';"
  );
  res.sendFile(path.join(distPath, "index.html")); // Corrigir para apontar para o arquivo correto
});

// Rota para criar um novo usuário
app.post("/create-user", async (req, res) => {
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
app.get("/list-users", async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ message: "Erro ao listar usuários." });
  }
});

// Rota para buscar usuário por e-mail
app.get("/search-user", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.getUserByEmail(email);
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

app.listen(port, () => {
  console.log(`Servidor rodando em http://127.0.0.1:${port}`);
});
