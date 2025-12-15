import { Platform } from "react-native"
import Constants from "expo-constants"

// ✅ VOTRE IP HOTSPOT
const LOCAL_IP = "172.16.142.221" 

function getApiUrl() {
  if (Platform.OS === "web") {
    return "http://localhost:3643"
  }


  return `http://${LOCAL_IP}:3643`
}

export const API_URL = getApiUrl()