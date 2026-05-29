import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

type UserType = {
  id: number;
  name: string;
};

let users: UserType[] = [];
let id = 1;

// PAYLOAD
const GET_PAYLOAD = `
    <html>
      <body>
          <h1>Express server is working</h1>
          <p>Port: ${PORT}</p>
      </body>
    </html>
    `;

const UPDATE_PAYLOAD = (id: number): string | UserType => {
  const user = users.find(u => u.id === Number(id));

  if (!user) return 'Not found';

  return user;
}


// CRUD
app.get("/", (_, res) => {
  res.send(GET_PAYLOAD)
});
app.get("/users", (_, res) => {
  res.json(users)
});

app.post("/users", (req, res) => {
  console.log('work')
  const user = {
    id: id,
    name: req.body.name ?? `test obj ${id}`,
  };

  id++;
  users.push(user);

  res.status(201).json(user);
});

app.put("/users/:id", (req, res) => {
  const user = UPDATE_PAYLOAD(+req.params.id);

  if (typeof user === 'string') return res.status(404).json({ error: user });

  user.name = req.body.name ?? user.name;

  res.json(user);
});

app.delete("/users/:id", (req, res) => {
  users = users.filter(u => u.id !== Number(req.params.id));

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/**
 * Use culr for test
 *
 * curl -X POST http://localhost:3000/users \
 * -H "Content-Type: application/json" \
 * -d '{"name":"Alex"}'
 */