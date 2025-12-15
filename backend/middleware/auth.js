// Middleware pour vérifier le token JWT et protéger les routes
const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token manquant ou invalide" })
    }

    // Extraire le token (format: "Bearer TOKEN")
    const token = authHeader.split(" ")[1]

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Ajouter les informations de l'utilisateur à la requête
    req.userId = decoded.userId
    req.userEmail = decoded.email

    // Passer au middleware/route suivant
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token invalide" })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expiré" })
    }
    return res.status(500).json({ error: "Erreur d'authentification" })
  }
}

module.exports = authMiddleware
