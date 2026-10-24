
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    name: "SEBY AI STUDIO"
  });
});

app.post("/api/generate", (req, res) => {
  const { prompt, mode, style } = req.body || {};

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({
      error: "Veuillez entrer une description."
    });
  }

  res.json({
    success: true,
    mode: mode || "image",
    style: style || "default",
    prompt: prompt.trim(),
    message: "Votre demande a été reçue. La génération IA réelle nécessite une API."
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SEBY AI STUDIO lancé sur le port ${PORT}`);
});
