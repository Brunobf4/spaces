import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

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
      // Use fs.promises for async file operations
      if (!fs.existsSync(dbDir)) {
        await fs.promises.mkdir(dbDir, { recursive: true });
      }

      if (!fs.existsSync(dbPath)) {
        await fs.promises.writeFile(dbPath, "");
      }

      this._db = new Database(dbPath);
      console.log("Conexão com o banco de dados estabelecida com sucesso!");
      this.createTable();
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

  static async createUser({ name, email, senha }: IUser): Promise<User> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    try {
      const existingUser = this._db
        ?.prepare("SELECT * FROM users WHERE email = $email")
        .get({ $email: email });

      if (existingUser) {
        throw new Error("E-mail já está em uso.");
      }

      const insertStatement = this._db?.prepare(
        `INSERT INTO users (name, email, senha) VALUES ($name, $email, $senha)`
      );
      const info = insertStatement?.run({
        $name: name,
        $email: email,
        $senha: senha,
      });
      console.log(`Usuário adicionado com ID: ${info.lastInsertRowid}`);
      return new User(name, email, senha);
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
