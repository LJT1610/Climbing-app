// Routes d'authentification (/register, /login)
const express = require("express")
const router = express.Router()
const UserModel = require("../models/userModel")

// POST /register - Inscription d'un nouvel utilisateur
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" })
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Format d'email invalide" })
    }

    // Créer l'utilisateur
    const user = await UserModel.register(email.trim().toLowerCase(), password)

    res.status(201).json({
      message: "Inscription réussie",
      user,
    })
  } catch (error) {
    if (error.message === "Cet email est déjà utilisé") {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email" })
    }
    console.error("Erreur lors de l'inscription:", error)
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" })
  }
})

// POST /login - Connexion d'un utilisateur
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" })
    }

    // Authentifier l'utilisateur
    const result = await UserModel.login(email.trim().toLowerCase(), password)

    res.json({
      message: "Connexion réussie",
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    if (error.message === "Email ou mot de passe incorrect") {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" })
    }
    console.error("Erreur lors de la connexion:", error)
    res.status(500).json({ error: "Erreur serveur lors de la connexion" })
  }
})

module.exports = router
