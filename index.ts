import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (_, res) => {
  res.send(`
    <html>
      <body>
        <h1>Express server is working</h1>
        <p>Port: ${PORT}</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});