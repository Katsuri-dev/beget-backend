import express from "express";
import helmet from "helmet";
import { Pool } from "pg";

const app = express();
const PORT = 3000;

app.use(helmet());

app.use(express.json({ limit: "10kb" }));

const pool = new Pool({
  host: "postgres",
  port: 5432,
  database: "appdb",
  user: "appuser",
  password: "password",
});

function validateName(name: any): string | null {
  if (typeof name !== "string") return "Name must be string";

  const trimmed = name.trim();

  if (!trimmed) return "Name is required";
  if (trimmed.length > 50) return "Name too long";

  // защита от мусора / HTML / скриптов
  if (/[<>]/.test(trimmed)) {
    return "Invalid characters";
  }

  return null;
}

const GET_PAYLOAD = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Users CRUD</title>
</head>

<body>
    <h1>Express server is working</h1>
    <p>Port: ${PORT}</p>

    <button id="get-users-btn">Get users</button>

    <hr>

    <form id="create-user-form">
        <input id="user-name" placeholder="user name" />
        <button type="submit">Submit</button>
    </form>

    <hr>

    <div id="users-list"></div>

<script>
const usersList = document.getElementById("users-list");

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function loadUsers() {
    const res = await fetch("/users");
    const users = await res.json();

    usersList.innerHTML = "";

    users.forEach(user => {
        const div = document.createElement("div");

        const span = document.createElement("span");
        span.textContent = user.id + ": " + user.name; // SAFE (no innerHTML)

        const btn = document.createElement("button");
        btn.textContent = "Delete";
        btn.onclick = () => deleteUser(user.id);

        div.appendChild(span);
        div.appendChild(btn);

        usersList.appendChild(div);
    });
}

async function deleteUser(id) {
    await fetch("/users/" + id, { method: "DELETE" });
    loadUsers();
}

document.getElementById("get-users-btn")
    .addEventListener("click", loadUsers);

document.getElementById("create-user-form")
    .addEventListener("submit", async (e) => {
        e.preventDefault();

        const input = document.getElementById("user-name");

        await fetch("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: input.value })
        });

        input.value = "";
        loadUsers();
    });
</script>

</body>
</html>
`;

app.get("/", (_, res) => {
  res.send(GET_PAYLOAD);
});

app.get("/users", async (_, res) => {
  try {
    const result = await pool.query(
        "SELECT * FROM users ORDER BY id"
    );

    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const error = validateName(req.body.name);

    if (error) {
      return res.status(400).json({ error });
    }

    const name = req.body.name.trim();

    const result = await pool.query(
        `INSERT INTO users (name) VALUES ($1) RETURNING *`,
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
        `DELETE FROM users WHERE id = $1 RETURNING *`,
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});