"use client"

// Écran de connexion et d'inscription
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useAuth } from "../App"
import { API_URL } from "../config"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { signIn } = useAuth()

  // Fonction de connexion
  const handleLogin = async () => {
    console.log("[v0] 📱 LoginScreen - handleLogin appelé")
    console.log("[v0] Email:", email)

    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      console.log("[v0] ❌ Champs vides")
      return
    }

    setIsLoading(true)
    setError("")
    console.log("[v0] 🔄 Tentative de connexion...")
    console.log("[v0] URL appelée:", `${API_URL}/api/auth/login`)

    try {
      console.log("[v0] 📤 Envoi de la requête fetch...")
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      console.log("[v0] 📥 Réponse reçue, status:", response.status)
      const data = await response.json()
      console.log("[v0] 📦 Data reçue:", data)

      if (response.ok) {
        console.log("[v0] ✅ Connexion réussie, token reçu")
        console.log("[v0] 🔑 Appel de signIn avec le token")
        await signIn(data.token)
        console.log("[v0] ✅ signIn terminé")
      } else {
        console.log("[v0] ❌ Erreur serveur:", data.error)
        setError(data.error || "Erreur lors de la connexion")
      }
    } catch (error) {
      console.error("[v0] ❌ ERREUR CRITIQUE lors de la connexion:", error)
      console.error("[v0] Type d'erreur:", error.name)
      console.error("[v0] Message:", error.message)
      setError("Impossible de se connecter au serveur. Vérifiez votre connexion réseau et que le backend est démarré.")
    } finally {
      setIsLoading(false)
      console.log("[v0] 🏁 handleLogin terminé")
    }
  }

  // Fonction d'inscription
  const handleRegister = async () => {
    console.log("[v0] 📱 LoginScreen - handleRegister appelé")
    console.log("[v0] Email:", email)

    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      console.log("[v0] ❌ Champs vides")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      console.log("[v0] ❌ Mot de passe trop court")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide")
      console.log("[v0] ❌ Email invalide")
      return
    }

    setIsLoading(true)
    setError("")
    console.log("[v0] 🔄 Tentative d'inscription...")
    console.log("[v0] URL appelée:", `${API_URL}/api/auth/register`)

    try {
      console.log("[v0] 📤 Envoi de la requête fetch...")
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      console.log("[v0] 📥 Réponse reçue, status:", response.status)
      const data = await response.json()
      console.log("[v0] 📦 Data reçue:", data)

      if (response.ok) {
        console.log("[v0] ✅ Inscription réussie, token reçu")
        console.log("[v0] 🔑 Appel de signIn avec le token")
        await signIn(data.token)
        console.log("[v0] ✅ signIn terminé")
      } else {
        console.log("[v0] ❌ Erreur serveur:", data.error)
        setError(data.error || "Erreur lors de l'inscription")
      }
    } catch (error) {
      console.error("[v0] ❌ ERREUR CRITIQUE lors de l'inscription:", error)
      console.error("[v0] Type d'erreur:", error.name)
      console.error("[v0] Message:", error.message)
      setError("Impossible de se connecter au serveur. Vérifiez votre connexion réseau et que le backend est démarré.")
    } finally {
      setIsLoading(false)
      console.log("[v0] 🏁 handleRegister terminé")
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🧗</Text>
          <Text style={styles.subtitle}>Gestion de Séances</Text>
          <Text style={styles.subtitle}>d'Escalade</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={isLogin ? handleLogin : handleRegister} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? "Se connecter" : "S'inscrire"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={isLoading}>
            <Text style={styles.switchText}>
              {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 80,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchText: {
    color: "#007AFF",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
})
