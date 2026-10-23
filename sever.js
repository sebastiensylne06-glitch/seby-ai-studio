
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({
    limit: "1mb"
}));

// Fichiers publics
app.use(express.static(
    path.join(__dirname, "public")
));

// Vérifier le serveur
app.get("/api/health", (req, res) => {

    res.json({

        ok: true,

        app: "SEBY AI STUDIO",

        message: "Le serveur fonctionne correctement."

    });

});

// Préparer une création
app.post("/api/generate", (req, res) => {

    const {
        prompt,
        mode,
        style
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {

        return res.status(400).json({

            error: "Veuillez saisir une description."

        });

    }

    const validModes = [
        "image",
        "logo",
        "writing",
        "video"
    ];

    if (!validModes.includes(mode)) {

        return res.status(400).json({

            error: "Type de création invalide."

        });

    }

    res.json({

        demo: true,

        mode,

        style: style || "cinématique",

        prompt: String(prompt).trim(),

        message:
            "Votre demande a été préparée. " +
            "Connectez une API IA côté serveur " +
            "pour générer le résultat réel."

    });

});

// Page principale
app.get("*", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});

// Démarrage
app.listen(PORT, () => {

    console.log("--------------------------------");

    console.log("       SEBY AI STUDIO");

    console.log("--------------------------------");

    console.log(
        `Serveur : http://localhost:${PORT}`
    );

});
