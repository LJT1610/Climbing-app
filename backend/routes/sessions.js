// Routes CRUD pour les séances d'escalade (protégées par authentification)
const express = require("express")
const router = express.Router()
const SessionModel = require("../models/sessionModel")
const authMiddleware = require("../middleware/auth")

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware)

// GET /sessions - Récupérer toutes les séances de l'utilisateur connecté
router.get("/", async (req, res) => {
  try {
    const sessions = await SessionModel.getAllByUser(req.userId)
    res.json({ sessions })
  } catch (error) {
    console.error("Erreur lors de la récupération des séances:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des séances" })
  }
})

// GET /sessions/:id - Récupérer une séance spécifique
router.get("/:id", async (req, res) => {
  try {
    const session = await SessionModel.getById(req.params.id, req.userId)

    if (!session) {
      return res.status(404).json({ error: "Séance non trouvée" })
    }

    res.json({ session })
  } catch (error) {
    console.error("Erreur lors de la récupération de la séance:", error)
    res.status(500).json({ error: "Erreur lors de la récupération de la séance" })
  }
})

// POST /sessions - Créer une nouvelle séance
router.post("/", async (req, res) => {
  try {
    console.log("[v0 Backend] POST /sessions called")
    console.log("[v0 Backend] User ID:", req.userId)
    console.log("[v0 Backend] Request body:", req.body)

    const { name, date, duration, location, notes, photoPath } = req.body

    // Validation des données obligatoires
    if (!name || !date || !duration) {
      console.log("[v0 Backend] Validation failed: missing required fields")
      return res.status(400).json({
        error: "Nom, date et durée sont requis",
        details: { name: !name, date: !date, duration: !duration },
      })
    }

    if (isNaN(duration) || duration <= 0) {
      console.log("[v0 Backend] Validation failed: invalid duration")
      return res.status(400).json({ error: "La durée doit être un nombre positif" })
    }

    // Validation du format de date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: "Format de date invalide (attendu: YYYY-MM-DD)" })
    }

    const sessionData = {
      name: name.trim(),
      date,
      duration: Number.parseInt(duration),
      location: location ? location.trim() : null,
      notes: notes ? notes.trim() : null,
      photoPath,
    }

    console.log("[v0 Backend] Creating session with data:", sessionData)
    const newSession = await SessionModel.create(req.userId, sessionData)
    console.log("[v0 Backend] Session created successfully:", newSession)

    res.status(201).json({
      message: "Séance créée avec succès",
      session: newSession,
    })
  } catch (error) {
    console.error("[v0 Backend] Error creating session:", error)
    res.status(500).json({
      error: "Erreur lors de la création de la séance",
      details: error.message,
    })
  }
})

// PUT /sessions/:id - Mettre à jour une séance
router.put("/:id", async (req, res) => {
  try {
    const { name, date, duration, location, notes, photoPath } = req.body

    // Validation des données obligatoires
    if (!name || !date || !duration) {
      return res.status(400).json({ error: "Nom, date et durée sont requis" })
    }

    const sessionData = {
      name,
      date,
      duration: Number.parseInt(duration),
      location,
      notes,
      photoPath,
    }

    const updatedSession = await SessionModel.update(req.params.id, req.userId, sessionData)

    res.json({
      message: "Séance mise à jour avec succès",
      session: updatedSession,
    })
  } catch (error) {
    if (error.message === "Séance non trouvée ou accès non autorisé") {
      return res.status(404).json({ error: error.message })
    }
    console.error("Erreur lors de la mise à jour de la séance:", error)
    res.status(500).json({ error: "Erreur lors de la mise à jour de la séance" })
  }
})

// DELETE /sessions/:id - Supprimer une séance
router.delete("/:id", async (req, res) => {
  try {
    console.log("[v0 Backend] DELETE /sessions/:id called")
    console.log("[v0 Backend] Session ID:", req.params.id)
    console.log("[v0 Backend] User ID:", req.userId)

    const sessionId = Number.parseInt(req.params.id)

    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "ID de séance invalide" })
    }

    await SessionModel.delete(sessionId, req.userId)
    console.log("[v0 Backend] Session deleted successfully")

    res.json({
      message: "Séance supprimée avec succès",
      deletedId: sessionId,
    })
  } catch (error) {
    console.error("[v0 Backend] Error deleting session:", error)

    if (error.message === "Séance non trouvée ou accès non autorisé") {
      return res.status(404).json({ error: error.message })
    }

    res.status(500).json({
      error: "Erreur lors de la suppression de la séance",
      details: error.message,
    })
  }
})

module.exports = router
