// Connexion à la base de données MySQL
const mysql = require("mysql2")
require("dotenv").config()

// Création du pool de connexions pour de meilleures performances
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "climbing_sessions",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Utilisation des Promises pour faciliter l'async/await
const promisePool = pool.promise()

// Test de connexion
promisePool
  .query("SELECT 1")
  .then(() => {
    console.log("✅ Connexion MySQL réussie")
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion MySQL:", err.message)
  })

module.exports = promisePool
