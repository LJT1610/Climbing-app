// Modèle pour la gestion des utilisateurs (inscription, connexion)
const db = require("../db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

class UserModel {
  // Inscription d'un nouvel utilisateur
  static async register(email, password) {
    try {
      // Vérifier si l'email existe déjà
      const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email])
      if (existing.length > 0) {
        throw new Error("Cet email est déjà utilisé")
      }

      // Hash du mot de passe avec bcrypt (10 rounds de salt)
      const hashedPassword = await bcrypt.hash(password, 10)

      // Insertion du nouvel utilisateur
      const [result] = await db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword])

      return {
        id: result.insertId,
        email,
      }
    } catch (error) {
      throw error
    }
  }

  // Connexion d'un utilisateur
  static async login(email, password) {
    try {
      // Récupérer l'utilisateur par email
      const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email])

      if (users.length === 0) {
        throw new Error("Email ou mot de passe incorrect")
      }

      const user = users[0]

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        throw new Error("Email ou mot de passe incorrect")
      }

      // Générer un token JWT valide 7 jours
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" })

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      }
    } catch (error) {
      throw error
    }
  }

  // Récupérer un utilisateur par ID
  static async getUserById(userId) {
    try {
      const [users] = await db.query("SELECT id, email, created_at FROM users WHERE id = ?", [userId])
      return users[0] || null
    } catch (error) {
      throw error
    }
  }
}

module.exports = UserModel
