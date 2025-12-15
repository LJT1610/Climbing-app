"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import { API_URL } from "../config"

export default function ConnectionTestScreen({ onConfigured }) {
  const [customIP, setCustomIP] = useState("")
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)
  const [currentAPI, setCurrentAPI] = useState(API_URL)

  useEffect(() => {
    testConnection(API_URL)
  }, [])

  const testConnection = async (url) => {
    setTesting(true)
    setTestResult(null)

    try {
      console.log("[v0] Testing connection to:", url)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${url}/api/health`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setTestResult({
          success: true,
          message: "Connexion reussie au backend",
          details: data,
        })
        return true
      } else {
        setTestResult({
          success: false,
          message: `Erreur HTTP: ${response.status}`,
        })
        return false
      }
    } catch (error) {
      console.error("[v0] Connection test error:", error)
      setTestResult({
        success: false,
        message: error.name === "AbortError" ? "Timeout: Le serveur ne repond pas" : `Erreur: ${error.message}`,
        details: "Verifiez que le backend est lance et que le pare-feu autorise le port 3000",
      })
      return false
    } finally {
      setTesting(false)
    }
  }

  const handleTestCustomIP = async () => {
    if (!customIP.trim()) {
      alert("Veuillez entrer une adresse IP")
      return
    }

    const testURL = `http://${customIP}:3000`
    setCurrentAPI(testURL)
    const success = await testConnection(testURL)

    if (success && onConfigured) {
      setTimeout(() => {
        onConfigured(testURL)
      }, 2000)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Test de Connexion</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>URL actuelle</Text>
          <Text style={styles.urlText}>{currentAPI}</Text>
        </View>

        {testing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Test en cours...</Text>
          </View>
        ) : testResult ? (
          <View style={[styles.resultBox, testResult.success ? styles.successBox : styles.errorBox]}>
            <Text style={styles.resultTitle}>{testResult.success ? "✅ Succes" : "❌ Echec"}</Text>
            <Text style={styles.resultMessage}>{testResult.message}</Text>
            {testResult.details && (
              <Text style={styles.resultDetails}>{JSON.stringify(testResult.details, null, 2)}</Text>
            )}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration manuelle</Text>
          <Text style={styles.instructions}>Entrez votre adresse IP locale (ex: 192.168.1.45)</Text>

          <TextInput
            style={styles.input}
            placeholder="192.168.1.45"
            value={customIP}
            onChangeText={setCustomIP}
            autoCapitalize="none"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.button} onPress={handleTestCustomIP} disabled={testing}>
            <Text style={styles.buttonText}>Tester cette IP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment trouver votre IP ?</Text>
          <Text style={styles.helpText}>Windows: Ouvrez cmd et tapez: ipconfig</Text>
          <Text style={styles.helpText}>Cherchez "Adresse IPv4"</Text>
          <Text style={styles.helpText}>Mac/Linux: Ouvrez terminal et tapez: ifconfig</Text>
        </View>

        <TouchableOpacity style={styles.retryButton} onPress={() => testConnection(currentAPI)} disabled={testing}>
          <Text style={styles.buttonText}>Retester la connexion</Text>
        </TouchableOpacity>

        {testResult?.success && (
          <TouchableOpacity style={styles.continueButton} onPress={() => onConfigured && onConfigured(currentAPI)}>
            <Text style={styles.buttonText}>Continuer vers l'app</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  urlText: {
    fontFamily: "monospace",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  resultBox: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 16,
    marginBottom: 5,
  },
  resultDetails: {
    fontFamily: "monospace",
    fontSize: 12,
    marginTop: 10,
  },
  instructions: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  retryButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
})
