import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("bingo.db");

// Initialize Database
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

// Default settings
const defaultSettings = [
  { key: "card_price", value: "10" },
  { key: "total_weeks", value: "4" },
  { key: "current_week", value: "1" },
  { key: "pix_key", value: "seu-pix@aqui.com" },
  { key: "whatsapp_number", value: "5511999999999" }
];

for (const setting of defaultSettings) {
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(setting.key, setting.value);
}

// Create admin if not exists
db.prepare("INSERT OR IGNORE INTO users (username, password, is_admin) VALUES (?, ?, ?)").run("admin", "admin123", 1);

const app = express();

async function startServer() {
  const PORT = 3000;
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json({ id: user.id, username: user.username, isAdmin: !!user.is_admin });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, password);
      res.json({ id: result.lastInsertRowid, username, isAdmin: false });
    } catch (e) {
      res.status(400).json({ error: "Usuário já existe" });
    }
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all() as any[];
    const settingsObj = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsObj);
  });

  app.post("/api/admin/settings", (req, res) => {
    const { card_price, total_weeks, current_week, pix_key, whatsapp_number } = req.body;
    if (card_price !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'card_price'").run(card_price.toString());
    if (total_weeks !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'total_weeks'").run(total_weeks.toString());
    if (current_week !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'current_week'").run(current_week.toString());
    if (pix_key !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'pix_key'").run(pix_key.toString());
    if (whatsapp_number !== undefined) db.prepare("UPDATE settings SET value = ? WHERE key = 'whatsapp_number'").run(whatsapp_number.toString());
    res.json({ success: true });
  });

  app.get("/api/draws", (req, res) => {
    const draws = db.prepare("SELECT * FROM draws ORDER BY week_number DESC").all();
    res.json(draws.map((d: any) => ({ ...d, numbers: JSON.parse(d.numbers) })));
  });

  app.post("/api/admin/draw", (req, res) => {
    const { week_number, numbers } = req.body;
    db.prepare("INSERT OR REPLACE INTO draws (week_number, numbers) VALUES (?, ?)").run(week_number, JSON.stringify(numbers));
    res.json({ success: true });
  });

  app.get("/api/user/cards/:userId", (req, res) => {
    const cards = db.prepare("SELECT * FROM cards WHERE user_id = ?").all(req.params.userId);
    res.json(cards.map((c: any) => ({ ...c, numbers: JSON.parse(c.numbers) })));
  });

  app.post("/api/cards/purchase", (req, res) => {
    const { userId, numbers, weekNumber } = req.body;
    // Set purchased to 0 (pending)
    const result = db.prepare("INSERT INTO cards (user_id, numbers, purchased, week_number) VALUES (?, ?, 0, ?)")
      .run(userId, JSON.stringify(numbers), weekNumber);
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.get("/api/admin/cards/pending", (req, res) => {
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
    db.prepare("UPDATE cards SET purchased = 1 WHERE id = ?").run(cardId);
    res.json({ success: true });
  });

  app.post("/api/admin/cards/delete", (req, res) => {
    const { cardId } = req.body;
    db.prepare("DELETE FROM cards WHERE id = ?").run(cardId);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
