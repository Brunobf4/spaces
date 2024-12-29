import sqlite3, { Database, type } from "sqlite3";
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
  private static _db: Database | null;

  constructor(name: string, email: string, senha: string) {
    Object.assign(this, { _name: name, _email: email, _senha: senha });
    Object.freeze(this);
  }

  static async initializeDatabase(): Promise<void> {
    const dbDir = path.resolve(__dirname, "db");
    const dbPath = path.join(dbDir, "database.db");

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, "");
    }

    return new Promise<void>((resolve, reject) => {
      if (!this._db) {
        this._db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            console.error("Erro ao conectar ao banco de dados:", err.message);
            reject(err);
          } else {
            console.log(
              "Conexão com o banco de dados estabelecida com sucesso!"
            );
            this.createTable();
            resolve();
          }
        });
      } else {
        console.log("Banco de dados já está conectado.");
        resolve();
      }
    });
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
    this._db?.run(createTableSQL, (err) => {
      if (err) {
        console.error("Erro ao criar tabela:", err.message);
      } else {
        console.log("Tabela 'users' criada ou já existe.");
      }
    });
  }

  static async createUser({ name, email, senha }: IUser): Promise<User> {
    if (!this._db) {
      await this.initializeDatabase();
    }

    return new Promise((resolve, reject) => {
      this._db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        (err, row) => {
          if (err) {
            console.error("Erro ao verificar e-mail:", err.message);
            return reject(err);
          }
          if (row) {
            return reject(new Error("E-mail já está em uso."));
          }

          this._db.run(
            `INSERT INTO users (name, email, senha) VALUES (?, ?, ?)`,
            [name, email, senha],
            function (err) {
              if (err) {
                console.error("Erro ao inserir usuário:", err.message);
                reject(err);
              } else {
                console.log(`Usuário adicionado com ID: ${this.lastID}`);
                const newUser = new User(name, email, senha);
                resolve(newUser);
              }
            }
          );
        }
      );
    });
  }

  // Método para listar um usuário pelo e-mail
  static async getUserByEmail(email: string): Promise<User | null> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    return new Promise((resolve, reject) => {
      this._db?.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        (err, row) => {
          if (err) {
            console.error("Erro ao buscar usuário:", err.message);
            reject(err);
          } else {
            if (row) {
              const user = new User(row.name, row.email, row.senha);
              resolve(user);
            } else {
              resolve(null); // Nenhum usuário encontrado
            }
          }
        }
      );
    });
  }

  // Método para listar todos os usuários
  static async getAllUsers(): Promise<User[]> {
    if (!this._db) {
      await this.initializeDatabase();
    }
    return new Promise((resolve, reject) => {
      this._db?.all(`SELECT * FROM users`, (err, rows) => {
        if (err) {
          console.error("Erro ao listar usuários:", err.message);
          reject(err);
        } else {
          const users = rows.map(
            (row) => new User(row.name, row.email, row.senha)
          );
          resolve(users);
        }
      });
    });
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
