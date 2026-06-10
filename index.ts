import express from "express";
import { Pool } from "pg";

const app = express();
const PORT = 3000;

const pool = new Pool({
  host: "postgres",
  port: 5432,
  database: "appdb",
  user: "appuser",
  password: "password",
});

app.use(express.json());

const GET_PAYLOAD = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users CRUD</title>
</head>

<body>
    <h1>Express server is working</h1>
    <p>Port: ${PORT}</p>

    <div>
        <button id="get-users-btn">Get users</button>
    </div>

    <hr>

    <form id="create-user-form">
        <input
            id="user-name"
            type="text"
            placeholder="user name"
        />
        <button type="submit">
            Submit
        </button>
    </form>

    <hr>

    <div id="users-list"></div>

    <script>
        const usersList = document.getElementById("users-list");

        async function loadUsers() {
            const response = await fetch("/users");
            const users = await response.json();

            usersList.innerHTML = "";

            users.forEach(user => {
                const div = document.createElement("div");

                div.innerHTML = \`
                    <span>\${user.id}: \${user.name}</span>

                    <button onclick="deleteUser(\${user.id})">
                        Delete
                    </button>

                    <hr>
                \`;

                usersList.appendChild(div);
            });
        }

        async function deleteUser(id) {
            await fetch('/users/' + id, {
                method: 'DELETE'
            });
        
            loadUsers();
        }

        document
            .getElementById("get-users-btn")
            .addEventListener("click", loadUsers);

        document
          .getElementById("create-user-form")
          .addEventListener("submit", async (e) => {
              e.preventDefault();
      
              const input = document.getElementById("user-name");
      
              await fetch('/users', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      name: input.value
                  })
              });
      
              input.value = "";
      
              loadUsers();
          });
    </script>
</body>
</html>
`;

app.get("/", (_, res) => {
  res.send(GET_PAYLOAD)
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
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    const result = await pool.query(
        `
      INSERT INTO users (name)
      VALUES ($1)
      RETURNING *
      `,
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
    const result = await pool.query(
        `
      DELETE FROM users
      WHERE id = $1
      RETURNING *
      `,
        [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      success: true,
      deleted: result.rows[0],
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
