// Script de test réseau pour diagnostiquer les problèmes de connexion
const os = require("os")
const http = require("http")

console.log("🔍 Diagnostic réseau pour Expo Go\n")

// Afficher toutes les interfaces réseau
console.log("📡 Interfaces réseau disponibles:")
const networkInterfaces = os.networkInterfaces()
Object.keys(networkInterfaces).forEach((interfaceName) => {
  const interfaces = networkInterfaces[interfaceName]
  interfaces.forEach((iface) => {
    if (iface.family === "IPv4" && !iface.internal) {
      console.log(`   ${interfaceName}: ${iface.address}`)
      console.log(`   → Utilisez cette IP dans mobile/config.js`)
      console.log(`   → Testez: http://${iface.address}:3643/api/health\n`)
    }
  })
})

// Tester si le port 3643 est disponible
const testPort = 3643
const server = http.createServer((req, res) => {
  res.writeHead(200)
  res.end("Test OK - Le serveur répond correctement")
})

server.listen(testPort, "0.0.0.0", () => {
  console.log(`✅ Le port ${testPort} est disponible`)
  console.log(`✅ Le serveur écoute sur toutes les interfaces (0.0.0.0)`)
  console.log(`\n📱 Depuis votre téléphone, testez les URLs suivantes dans un navigateur:\n`)

  Object.keys(networkInterfaces).forEach((interfaceName) => {
    const interfaces = networkInterfaces[interfaceName]
    interfaces.forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) {
        console.log(`   http://${iface.address}:${testPort}/api/health`)
      }
    })
  })

  console.log(`\n💡 Si ça ne fonctionne pas:`)
  console.log(`   1. Vérifiez que votre téléphone est sur le même WiFi`)
  console.log(`   2. Configurez le pare-feu Windows (voir DEPANNAGE_RESEAU.md)`)
  console.log(`   3. Vérifiez qu'aucun antivirus ne bloque Node.js`)

  console.log(`\n⏹️  Appuyez sur Ctrl+C pour arrêter ce test\n`)
})

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`❌ Le port ${testPort} est déjà utilisé`)
    console.log(`   Arrêtez le serveur backend avant de lancer ce test`)
  } else {
    console.error(`❌ Erreur: ${err.message}`)
  }
  process.exit(1)
})
