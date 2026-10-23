
const $ = selector => document.querySelector(selector);

const state = {
    tool: "image",
    recent: JSON.parse(
        localStorage.getItem("sebyStudioRecent") || "[]"
    )
};

const titles = {
    image: "Générateur d'images",
    video: "Studio vidéo",
    logo: "Créateur de logos",
    writing: "Assistant rédaction"
};

const prompts = {
    image: "Décrivez l'image que vous souhaitez créer...",
    video: "Décrivez votre idée de vidéo, la scène et l'ambiance...",
    logo: "Décrivez votre marque, son secteur et son style...",
    writing: "Décrivez le texte que vous souhaitez rédiger..."
};

// Notification
function toast(message) {
    const element = $("#toast");

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        element.classList.remove("show");
    }, 2600);
}

// Protection HTML
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

// Historique
function renderRecent() {
    const grid = $("#recentGrid");

    if (!state.recent.length) {
        grid.innerHTML = `
            <div class="empty-recent">
                Vos projets préparés apparaîtront ici.
            </div>
        `;
        return;
    }

    grid.innerHTML = state.recent.map(project => `
        <article class="recent-item">

            <small>
                ${escapeHtml(project.tool.toUpperCase())}
                ·
                ${escapeHtml(project.date)}
            </small>

            <p>
                ${escapeHtml(project.prompt)}
            </p>

            <b>
                ${escapeHtml(project.style || "Projet")}
            </b>

        </article>
    `).join("");
}

// Ouvrir un outil
function openTool(tool) {

    if (tool === "video") {
        toast("Le studio vidéo sera disponible dans une prochaine version.");
        return;
    }

    state.tool = tool;

    $("#welcome").classList.add("hidden");

    $(".tools-section").classList.add("hidden");

    $(".recent").classList.add("hidden");

    $("#studio").classList.remove("hidden");

    $("#studioTitle").textContent = titles[tool];

    $("#studioEyebrow").textContent =
        tool === "image"
            ? "CRÉATION VISUELLE"
            : tool === "logo"
            ? "IDENTITÉ DE MARQUE"
            : "ÉCRITURE IA";

    $("#crumbTitle").textContent = titles[tool];

    $("#prompt").placeholder = prompts[tool];

    $("#prompt").value = "";

    $("#resultArea").innerHTML = `
        <div class="placeholder-art">

            <div class="placeholder-sun"></div>

            <div class="placeholder-mountain m1"></div>

            <div class="placeholder-mountain m2"></div>

            <span>✦</span>

        </div>

        <h3>Votre espace de création</h3>

        <p>
            Votre description et les paramètres
            apparaîtront ici.
        </p>
    `;

    document.querySelectorAll(".nav").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === tool
        );
    });
}

// Retour accueil
function home() {

    $("#welcome").classList.remove("hidden");

    $(".tools-section").classList.remove("hidden");

    $(".recent").classList.remove("hidden");

    $("#studio").classList.add("hidden");

    $("#crumbTitle").textContent = "Accueil";

    document.querySelectorAll(".nav").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === "home"
        );
    });
}

// Préparer une création
async function generate() {

    const prompt = $("#prompt").value.trim();

    if (!prompt) {
        toast("Veuillez écrire une description avant de continuer.");

        $("#prompt").focus();

        return;
    }

    const button = $("#generateBtn");

    button.disabled = true;

    button.innerHTML = "<span>◌</span> Préparation...";

    $("#resultArea").innerHTML = `
        <div class="placeholder-art">

            <div class="placeholder-sun"></div>

            <div class="placeholder-mountain m1"></div>

            <div class="placeholder-mountain m2"></div>

            <span>✦</span>

        </div>

        <h3>Préparation de votre projet...</h3>

        <p>Nous organisons votre demande.</p>
    `;

    try {

        const response = await fetch("/api/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                prompt,

                mode: state.tool,

                style: $("#styleSelect").value

            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Une erreur est survenue."
            );
        }

        $("#resultArea").innerHTML = `
            <div class="result-description">
                ${escapeHtml(data.prompt)}
            </div>

            <h3>Votre demande est prête</h3>

            <p class="result-message">
                ${escapeHtml(data.message)}
            </p>
        `;

        const project = {

            tool: titles[state.tool],

            prompt,

            style: $("#styleSelect").value,

            date: new Date().toLocaleDateString("fr-FR")

        };

        state.recent.unshift(project);

        state.recent = state.recent.slice(0, 6);

        localStorage.setItem(
            "sebyStudioRecent",
            JSON.stringify(state.recent)
        );

        renderRecent();

        toast("Projet préparé. Mode démonstration.");

    } catch (error) {

        $("#resultArea").innerHTML = `
            <h3>Impossible de préparer le projet</h3>

            <p>
                ${escapeHtml(error.message)}
            </p>
        `;

        toast(error.message);

    } finally {

        button.disabled = false;

        button.innerHTML = `
            <span>✦</span>
            Préparer la création
            <b>→</b>
        `;

    }
}

// Navigation outils
document.querySelectorAll("[data-tool]").forEach(button => {

    button.addEventListener("click", () => {

        openTool(button.dataset.tool);

    });

});

// Navigation sidebar
document.querySelectorAll(".nav[data-view]").forEach(button => {

    button.addEventListener("click", () => {

        const view = button.dataset.view;

        if (view === "home") {

            home();

        } else {

            openTool(view);

        }

    });

});

// Retour
$("#backHome").addEventListener("click", home);

// Génération
$("#generateBtn").addEventListener("click", generate);

// Effacer historique
$("#clearRecent").addEventListener("click", () => {

    state.recent = [];

    localStorage.removeItem("sebyStudioRecent");

    renderRecent();

    toast("Historique effacé.");

});

// Menu mobile
$("#menuBtn").addEventListener("click", () => {

    $("#sidebar").classList.toggle("open");

});

// À propos
$("#aboutBtn").addEventListener("click", () => {

    toast("SEBY AI STUDIO — Version démonstration.");

});

// Fermer sidebar sur mobile
document.addEventListener("click", event => {

    if (
        event.target.closest(".nav") &&
        window.innerWidth <= 760
    ) {

        $("#sidebar").classList.remove("open");

    }

});

// Année
$("#year").textContent = new Date().getFullYear();

// Initialisation
renderRecent();
