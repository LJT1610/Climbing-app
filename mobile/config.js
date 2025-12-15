// Configuration de l'URL de l'API

import { Platform } from "react-native"
import Constants from "expo-constants"

const LOCAL_IP = "192.168.56.1"

function getApiUrl() {
  if (Platform.OS === "web") {
    return "http://localhost:3000"
  }

  // Check if running in tunnel mode
  const debuggerHost = Constants.expoConfig?.hostUri
  if (debuggerHost) {
    // Extract tunnel URL if available
    const tunnelUrl = debuggerHost.split(":").shift()
    if (tunnelUrl && tunnelUrl.includes(".exp.direct")) {
      console.log("[v0] 🌐 Mode TUNNEL détecté")
      return `https://${tunnelUrl}`
    }
  }

  // Use local IP if configured
  if (LOCAL_IP !== "192.168.56.1") {
    return `http://${LOCAL_IP}:3643`
  }

  // Fallback
  return "http://localhost:3000"
}

export const API_URL = getApiUrl()

// Logging
console.log("========================================")
console.log("[v0] 🔧 CONFIGURATION API")
console.log("========================================")
console.log("[v0] Plateforme:", Platform.OS)
console.log("[v0] API_URL:", API_URL)
console.log("========================================")

if (Platform.OS !== "web" && LOCAL_IP === "192.168.56.1" && !API_URL.includes("exp.direct")) {
  console.warn("========================================")
  console.warn("[v0] ⚠️  IP NON CONFIGURÉE")
  console.warn("========================================")
  console.warn("[v0] Utilisez MODE TUNNEL (recommandé):")
  console.warn("[v0]   npm run start:tunnel")
  console.warn("[v0] OU configurez votre IP locale dans config.js")
  console.warn("========================================")
}
