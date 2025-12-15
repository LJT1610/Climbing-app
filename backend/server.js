// Serveur principal Express
const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const sessionsRoutes = require("./routes/sessions")
const uploadRoutes = require("./routes/upload")

const app = express()
const PORT = process.env.PORT || 3643

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("📁 Dossier uploads créé")
}

// Middlewares
app.use(cors()) // Permettre les requêtes cross-origin
app.use(express.json()) // Parser le JSON
app.use(express.urlencoded({ extended: true })) // Parser les données URL-encoded

// Servir les fichiers statiques (photos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/sessions", sessionsRoutes)
app.use("/api/upload", uploadRoutes)

// Route de test
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API de gestion de séances d'escalade",
    timestamp: new Date().toISOString(),
  })
})

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" })
})

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err)
  res.status(500).json({ error: "Erreur interne du serveur" })
})

// Démarrage du serveur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`)
  console.log(`📍 API disponible localement: http://localhost:${PORT}/api`)
  console.log(`📱 API disponible sur réseau: http://0.0.0.0:${PORT}/api`)
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
  console.log(`\n💡 Pour tester depuis Expo Go:`)
  console.log(`   1. Trouvez votre IP locale (ipconfig sur Windows)`)
  console.log(`   2. Configurez-la dans mobile/config.js`)
  console.log(`   3. Testez sur http://VOTRE_IP:${PORT}/api/health`)
})

module.exports = app
