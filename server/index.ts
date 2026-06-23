import express from "express";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";


const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientPath = path.resolve(__dirname, "../client");

app.use(express.json({ limit: "40kb" }));
app.use(express.static(clientPath));

const pool = new Pool({
  host: "postgres",
  port: 5432,
  database: "appdb",
  user: "appuser",
  password: "password",
});

function validateName(name: any) {
  if (typeof name !== "string") return "Name must be string";

  const trimmed = name.trim();

  if (!trimmed) return "Name is required";
  if (trimmed.length > 50) return "Name too long";

  return null;
}

app.get("/", (_, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

app.get("/users", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id");
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const error = validateName(req.body.name);
    if (error) return res.status(400).json({ error });

    const name = req.body.name.trim();

    const result = await pool.query(
        "INSERT INTO users (name) VALUES ($1) RETURNING *",
        [name]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING *",
        [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

app.listen(PORT, "0.0.0.0 ", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});