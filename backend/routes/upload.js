// Route pour l'upload de photos
const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const authMiddleware = require("../middleware/auth")

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique avec timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, "session_" + uniqueSuffix + ext)
  },
})

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Type de fichier non supporté. Utilisez JPG, PNG ou GIF."), false)
  }
}

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5 MB
  },
})

// POST /upload - Upload d'une photo (protégé par authentification)
router.post("/", authMiddleware, upload.single("photo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Aucun fichier fourni",
        details: "Le champ 'photo' est requis",
      })
    }

    const photoPath = "/uploads/" + req.file.filename

    res.status(201).json({
      message: "Photo uploadée avec succès",
      photoPath: photoPath,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
    })
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    res.status(500).json({
      error: "Erreur lors de l'upload de la photo",
      details: error.message,
    })
  }
})

// Gestion des erreurs multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Le fichier est trop volumineux",
        details: "Taille maximale: 5 MB",
      })
    }
    return res.status(400).json({
      error: "Erreur d'upload",
      details: error.message,
    })
  }
  if (error) {
    return res.status(400).json({
      error: error.message || "Erreur inconnue lors de l'upload",
    })
  }
  next()
})

module.exports = router
