"use client"

// Point d'entrée principal de l'application mobile React Native
import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ActivityIndicator, View } from "react-native"

import LoginScreen from "./screens/LoginScreen"
import SessionsListScreen from "./screens/SessionsListScreen"
import AddSessionScreen from "./screens/AddSessionScreen"

const Stack = createNativeStackNavigator()

// Context pour gérer l'authentification globalement
const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [userToken, setUserToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] App - useEffect initial, chargement du token...")
    loadToken()
  }, [])

  useEffect(() => {
    console.log("[v0] 🔄 App - userToken state changed:", userToken ? "Token existe" : "Pas de token")
  }, [userToken])

  const loadToken = async () => {
    try {
      console.log("[v0] 📂 App - Chargement du token depuis AsyncStorage...")
      const token = await AsyncStorage.getItem("userToken")
      console.log("[v0] 📦 App - Token chargé:", token ? `${token.substring(0, 20)}...` : "Aucun token trouvé")
      setUserToken(token)
    } catch (error) {
      console.error("[v0] ❌ App - Erreur lors du chargement du token:", error)
    } finally {
      setIsLoading(false)
      console.log("[v0] ✅ App - Chargement terminé")
    }
  }

  const signIn = useCallback(async (token) => {
    try {
      console.log("[v0] 🔐 App - signIn appelé avec token:", token ? `${token.substring(0, 20)}...` : "null")
      console.log("[v0] 💾 App - Sauvegarde du token dans AsyncStorage...")
      await AsyncStorage.setItem("userToken", token)
      console.log("[v0] ✅ App - Token sauvegardé avec succès")
      console.log("[v0] 🔄 App - Mise à jour de l'état userToken...")
      setUserToken(token)
      console.log("[v0] ✅ App - État mis à jour, navigation devrait changer")
    } catch (error) {
      console.error("[v0] ❌ App - Erreur lors de la sauvegarde du token:", error)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      console.log("[v0] 🚪 App - Déconnexion en cours...")
      await AsyncStorage.removeItem("userToken")
      setUserToken(null)
      console.log("[v0] ✅ App - Déconnexion réussie")
    } catch (error) {
      console.error("[v0] ❌ App - Erreur lors de la déconnexion:", error)
    }
  }, [])

  if (isLoading) {
    console.log("[v0] ⏳ App - Affichage du loader...")
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  console.log("[v0] 🎨 App - Rendu de la navigation")
  console.log("[v0] 🔑 App - userToken:", userToken ? "existe (connecté)" : "null (non connecté)")
  console.log("[v0] 📱 App - Affichage de:", userToken ? "SessionsList/AddSession" : "Login")

  return (
    <AuthContext.Provider value={{ userToken, signIn, signOut }}>
      <NavigationContainer>
        <Stack.Navigator>
          {userToken == null ? (
            // Stack pour les utilisateurs non connectés
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          ) : (
            // Stack pour les utilisateurs connectés
            <>
              <Stack.Screen
                name="SessionsList"
                component={SessionsListScreen}
                options={{
                  title: "Mes Séances d'Escalade",
                  headerStyle: { backgroundColor: "#007AFF" },
                  headerTintColor: "#fff",
                  headerTitleStyle: { fontWeight: "bold" },
                }}
              />
              <Stack.Screen
                name="AddSession"
                component={AddSessionScreen}
                options={{
                  title: "Nouvelle Séance",
                  headerStyle: { backgroundColor: "#007AFF" },
                  headerTintColor: "#fff",
                  headerTitleStyle: { fontWeight: "bold" },
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  )
}
