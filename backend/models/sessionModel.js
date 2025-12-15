// Modèle pour la gestion des séances d'escalade (CRUD)
const db = require("../db")
const fs = require("fs").promises
const path = require("path")

class SessionModel {
  // Récupérer toutes les séances d'un utilisateur
  static async getAllByUser(userId) {
    try {
      const [sessions] = await db.query(
        "SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC, created_at DESC",
        [userId],
      )
      return sessions
    } catch (error) {
      throw error
    }
  }

  // Récupérer une séance par ID
  static async getById(sessionId, userId) {
    try {
      const [sessions] = await db.query("SELECT * FROM sessions WHERE id = ? AND user_id = ?", [sessionId, userId])
      return sessions[0] || null
    } catch (error) {
      throw error
    }
  }

  // Créer une nouvelle séance
  static async create(userId, sessionData) {
    try {
      const { name, date, duration, location, notes, photoPath } = sessionData

      const [result] = await db.query(
        "INSERT INTO sessions (user_id, name, date, duration, location, notes, photo_path) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, name, date, duration, location || null, notes || null, photoPath || null],
      )

      return {
        id: result.insertId,
        user_id: userId,
        ...sessionData,
      }
    } catch (error) {
      throw error
    }
  }

  // Mettre à jour une séance
  static async update(sessionId, userId, sessionData) {
    try {
      const { name, date, duration, location, notes, photoPath } = sessionData

      // Vérifier que la séance appartient à l'utilisateur
      const session = await this.getById(sessionId, userId)
      if (!session) {
        throw new Error("Séance non trouvée ou accès non autorisé")
      }

      // Mise à jour
      await db.query(
        "UPDATE sessions SET name = ?, date = ?, duration = ?, location = ?, notes = ?, photo_path = ? WHERE id = ? AND user_id = ?",
        [name, date, duration, location || null, notes || null, photoPath || session.photo_path, sessionId, userId],
      )

      return await this.getById(sessionId, userId)
    } catch (error) {
      throw error
    }
  }

  // Supprimer une séance (et sa photo)
  static async delete(sessionId, userId) {
    try {
      // Récupérer la séance pour obtenir le chemin de la photo
      const session = await this.getById(sessionId, userId)
      if (!session) {
        throw new Error("Séance non trouvée ou accès non autorisé")
      }

      // Supprimer la photo si elle existe
      if (session.photo_path) {
        const photoFullPath = path.join(__dirname, "..", session.photo_path)
        try {
          await fs.unlink(photoFullPath)
        } catch (err) {
          console.warn("Photo non trouvée ou déjà supprimée:", err.message)
        }
      }

      // Supprimer la séance de la base de données
      await db.query("DELETE FROM sessions WHERE id = ? AND user_id = ?", [sessionId, userId])

      return { message: "Séance supprimée avec succès" }
    } catch (error) {
      throw error
    }
  }
}

module.exports = SessionModel
