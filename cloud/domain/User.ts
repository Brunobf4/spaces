import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

import bcrypt from "bcrypt";

const JWT_SECRET = "sua_chave_secreta_aqui"; // Mantenha isso seguro!
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Definição de tipo para os parâmetros do usuário
interface IUser {
  name: string;
  email: string;
  senha: string;
}

export default class User {
  private _name: string;
  private _email: string;
  private _senha: string;
  private static _db: Database | null = null;

  constructor(name: string, email: string, senha: string) {
    Object.assign(this, { _name: name, _email: email, _senha: senha });
    Object.freeze(this);
  }

  static async initializeDatabase(): Promise<void> {
    if (this._db) {
      console.log("Banco de dados já está conectado.");
      return;
    }

    const dbDir = path.resolve(__dirname, "db");
    const dbPath = path.join(dbDir, "database.db");

    try {
      console.log("Iniciando conexão com o banco de dados...");
      console.log("Diretório do banco:", dbDir);
      console.log("Caminho do banco:", dbPath);

      // Use fs.promises for async file operations
      if (!fs.existsSync(dbDir)) {
        await fs.promises.mkdir(dbDir, { recursive: true });
        console.log("Diretório do banco criado:", dbDir);
      }

      if (!fs.existsSync(dbPath)) {
        await fs.promises.writeFile(dbPath, "");
        console.log("Arquivo do banco criado:", dbPath);
      }

      this._db = new Database(dbPath);
      console.log("Conexão com o banco de dados estabelecida com sucesso!");
    } catch (error) {
      console.error("Erro ao conectar ao banco de dados:", error);
      throw error;
    }
  }

  static createTable(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL
      );
    `;
    try {
      this._db?.exec(createTableSQL);
      console.log("Tabela 'users' criada ou já existe.");
    } catch (err) {
      console.error("Erro ao criar tabela:", err);
      throw err;
    }
  }

  // Método para criar hash de senha
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Método para verificar senha
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Atualize o método createUser para usar hash
  static async createUser({ name, email, senha }: IUser): Promise<User> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      const hashedPassword = await this.hashPassword(senha);
      const insertStatement = this._db?.prepare(
        `INSERT INTO users (name, email, senha) VALUES ($name, $email, $senha)`
      );
      const info = insertStatement?.run({
        $name: name,
        $email: email,
        $senha: hashedPassword,
      });
      console.log(`Usuário adicionado com ID: ${info.lastInsertRowid}`);
      return new User(name, email, hashedPassword);
    } catch (err) {
      console.error("Erro ao inserir usuário:", err);
      throw err;
    }
  }

  // Método para listar um usuário pelo e-mail
  static async getUserByEmail(email: string): Promise<User | null> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      if (!this._db) throw new Error("Database not initialized");
      const stmt = this._db.prepare("SELECT * FROM users WHERE email = $email");
      const row = stmt.get({ $email: email });
      if (row) {
        return new User(row.name, row.email, row.senha);
      }
      return null;
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      throw err;
    }
  }

  // Método para listar todos os usuários
  static async getAllUsers(): Promise<User[]> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      const rows = this._db?.prepare(`SELECT * FROM users`).all();

      if (!rows) return [];

      return rows.map((row) => new User(row.name, row.email, row.senha));
    } catch (err) {
      console.error("Erro ao listar usuários:", err);
      throw err;
    }
  }

  // Método para atualizar nome
  static async updateName(email: string, newName: string): Promise<boolean> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      const stmt = this._db?.prepare(
        "UPDATE users SET name = $name WHERE email = $email"
      );
      const result = stmt.run({
        $name: newName,
        $email: email,
      });
      return result.changes > 0;
    } catch (err) {
      console.error("Erro ao atualizar nome:", err);
      throw err;
    }
  }

  // Método para atualizar email
  static async updateEmail(
    currentEmail: string,
    newEmail: string
  ): Promise<boolean> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      const stmt = this._db?.prepare(
        "UPDATE users SET email = $newEmail WHERE email = $currentEmail"
      );
      const result = stmt.run({
        $newEmail: newEmail,
        $currentEmail: currentEmail,
      });
      return result.changes > 0;
    } catch (err) {
      console.error("Erro ao atualizar email:", err);
      throw err;
    }
  }

  // Método para atualizar senha
  static async updatePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      // Primeiro, verifica se a senha atual está correta
      const user = await this.getUserByEmail(email);
      if (!user || !(await this.verifyPassword(currentPassword, user.senha))) {
        return false;
      }

      // Se a senha atual estiver correta, atualiza para a nova senha
      const hashedPassword = await this.hashPassword(newPassword);
      const stmt = this._db?.prepare(
        "UPDATE users SET senha = $senha WHERE email = $email"
      );
      const result = stmt.run({
        $senha: hashedPassword,
        $email: email,
      });
      return result.changes > 0;
    } catch (err) {
      console.error("Erro ao atualizar senha:", err);
      throw err;
    }
  }
  static createPostsTable(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        media_type TEXT NOT NULL,
        media_data TEXT,
        embedding TEXT,
        model_comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email)
      );
    `;
    try {
      if (!this._db) throw new Error("Database not initialized");
      this._db.exec(createTableSQL);
      console.log("Tabela 'posts' criada ou já existe.");
    } catch (err) {
      console.error("Erro ao criar tabela de posts:", err);
      throw err;
    }
  }

  static async initializeTables(): Promise<void> {
    try {
      await this.initializeDatabase();
      this.createTable();
      this.createPostsTable();
      console.log("Todas as tabelas foram inicializadas com sucesso!");
    } catch (error) {
      console.error("Erro ao inicializar tabelas:", error);
      throw error;
    }
  }

  static async generateEmbedding(
    text: string,
<<<<<<< HEAD
    model: string = "granite-embedding:278m"
=======
    model: string = "smollm2"
>>>>>>> refs/remotes/origin/main
  ): Promise<string | null> {
    try {
      const response = await fetch("http://localhost:11434/api/embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: model, input: text }),
      });

      if (!response.ok) {
        console.error(
          "Erro ao gerar embedding:",
          response.status,
          await response.text()
        );
        return null;
      }
      const data = await response.json();
      return JSON.stringify(data.embeddings[0]);
    } catch (error) {
      console.error("Erro na comunicação com a API de embedding:", error);
      return null;
    }
  }

  static async generateModelComment(
    postContent: string,
    model: string = "smollm2"
  ): Promise<string | null> {
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          prompt: `Gere um comentário breve sobre o seguinte post: ${postContent}.`,
          stream: false,
        }),
      });

      if (!response.ok) {
        console.error(
          "Erro ao gerar comentário do modelo:",
          response.status,
          await response.text()
        );
        return null;
      }
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Erro na comunicação com a API para comentário:", error);
      return null;
    }
  }

  static async createPost(
    userEmail: string,
    post: {
      title: string;
      content?: string;
      mediaType: "text" | "audio" | "video" | "mixed";
      mediaData?: string;
    }
  ): Promise<any> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      const embedding = await this.generateEmbedding(
        post.title + " " + post.content
      );
      const modelComment = await this.generateModelComment(
        post.title + " " + post.content
      );

      const stmt = this._db?.prepare(`
          INSERT INTO posts (user_email, title, content, media_type, media_data, embedding, model_comment)
          VALUES ($userEmail, $title, $content, $mediaType, $mediaData, $embedding, $modelComment)
        `);

      const result = stmt.run({
        $userEmail: userEmail,
        $title: post.title,
        $content: post.content || null,
        $mediaType: post.mediaType,
        $mediaData: post.mediaData || null,
        $embedding: embedding || null,
        $modelComment: modelComment || null,
      });

      return {
        id: result.lastInsertRowid,
        ...post,
        embedding,
        modelComment,
      };
    } catch (err) {
      console.error("Erro ao criar post:", err);
      throw err;
    }
  }

  static async getUserPosts(userEmail: string): Promise<any[]> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      const stmt = this._db?.prepare(`
          SELECT * FROM posts 
          WHERE user_email = $userEmail 
          ORDER BY created_at DESC
        `);

      return stmt.all({ $userEmail: userEmail });
    } catch (err) {
      console.error("Erro ao buscar posts do usuário:", err);
      throw err;
    }
  }

  static async getAllPosts(): Promise<any[]> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      const stmt = this._db?.prepare(`
        SELECT p.*, u.name as author_name 
        FROM posts p
        JOIN users u ON p.user_email = u.email
        ORDER BY p.created_at DESC
      `);

      return stmt.all();
    } catch (err) {
      console.error("Erro ao buscar todos os posts:", err);
      throw err;
    }
  }

  static async updatePostsTable(): Promise<void> {
    try {
      if (!this._db) throw new Error("Database not initialized");
      this._db.exec("ALTER TABLE posts ADD COLUMN embedding TEXT");
      console.log("Coluna 'embedding' adicionada à tabela 'posts'.");
    } catch (err) {
      console.error("Erro ao atualizar tabela de posts:", err);
      throw err;
    }
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get senha(): string {
    return this._senha;
  }
}
