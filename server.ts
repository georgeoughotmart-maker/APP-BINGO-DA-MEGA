import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request Logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong", timestamp: new Date().toISOString() });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });

  console.log("Starting database and vite...");

  let db: any;
  try {
    const dbPath = path.resolve(__dirname, "bingo.db");
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        is_admin INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        numbers TEXT,
        purchased INTEGER DEFAULT 0,
        week_number INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS draws (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_number INTEGER UNIQUE,
        numbers TEXT
      );
    `);

    const adminExists = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
    if (!adminExists) {
      db.prepare("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)").run("admin", "admin123", 1);
    }
    
    const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get().count;
    if (settingsCount === 0) {
      const defaultSettings = [
        { key: "card_price", value: "10" },
        { key: "total_weeks", value: "4" },
        { key: "current_week", value: "1" },
        { key: "pix_key", value: "seu-pix@aqui.com" },
        { key: "whatsapp_number", value: "5511999999999" }
      ];
      for (const s of defaultSettings) {
        db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(s.key, s.value);
      }
    }
    console.log("Database ready");
  } catch (err) {
    console.error("DB ERROR:", err);
  }

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    try {
      const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
      if (user) {
        res.json({ id: user.id, username: user.username, isAdmin: !!user.is_admin });
      } else {
        res.status(401).json({ error: "Credenciais inválidas" });
      }
    } catch (err) {
      res.status(500).json({ error: "Erro no banco de dados" });
    }
  });

  app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    try {
      const result = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, password);
      res.json({ id: result.lastInsertRowid, username, isAdmin: false });
    } catch (err) {
      res.status(400).json({ error: "Usuário já existe" });
    }
  });

  app.get("/api/settings", (req, res) => {
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsObj = settings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsObj);
  });

  app.post("/api/admin/settings", (req, res) => {
    const { card_price, total_weeks, current_week, pix_key, whatsapp_number } = req.body;
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    if (card_price !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'card_price'").run(card_price.toString());
    if (total_weeks !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'total_weeks'").run(total_weeks.toString());
    if (current_week !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'current_week'").run(current_week.toString());
    if (pix_key !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'pix_key'").run(pix_key.toString());
    if (whatsapp_number !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'whatsapp_number'").run(whatsapp_number.toString());
    res.json({ success: true });
  });

  app.get("/api/draws", (req, res) => {
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    const draws = db.prepare("SELECT * FROM draws ORDER BY week_number DESC").all();
    res.json(draws.map((d: any) => ({ ...d, numbers: JSON.parse(d.numbers) })));
  });

  app.post("/api/admin/draw", (req, res) => {
    const { week_number, numbers } = req.body;
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    db.prepare("INSERT OR REPLACE INTO draws (week_number, numbers) VALUES (?, ?)").run(week_number, JSON.stringify(numbers));
    res.json({ success: true });
  });

  app.get("/api/user/cards/:userId", (req, res) => {
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    const cards = db.prepare("SELECT * FROM cards WHERE user_id = ?").all(req.params.userId);
    res.json(cards.map((c: any) => ({ ...c, numbers: JSON.parse(c.numbers) })));
  });

  app.post("/api/cards/purchase", (req, res) => {
    const { userId, numbers, weekNumber } = req.body;
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    const result = db.prepare("INSERT INTO cards (user_id, numbers, purchased, week_number) VALUES (?, ?, 0, ?)")
      .run(userId, JSON.stringify(numbers), weekNumber);
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.get("/api/admin/cards/pending", (req, res) => {
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    const cards = db.prepare(`
      SELECT cards.*, users.username 
      FROM cards 
      JOIN users ON cards.user_id = users.id 
      WHERE cards.purchased = 0
    `).all();
    res.json(cards.map((c: any) => ({ ...c, numbers: JSON.parse(c.numbers) })));
  });

  app.post("/api/admin/cards/approve", (req, res) => {
    const { cardId } = req.body;
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    db.prepare("UPDATE cards SET purchased = 1 WHERE id = ?").run(cardId);
    res.json({ success: true });
  });

  app.post("/api/admin/cards/delete", (req, res) => {
    const { cardId } = req.body;
    if (!db) return res.status(500).json({ error: "Banco de dados indisponível" });
    db.prepare("DELETE FROM cards WHERE id = ?").run(cardId);
    res.json({ success: true });
  });

  try {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite ready");
  } catch (err) {
    console.error("VITE ERROR:", err);
  }
}

startServer();
