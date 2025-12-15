"use client"

// Écran pour ajouter une nouvelle séance avec photo
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "../App"
import { API_URL } from "../config"

export default function AddSessionScreen({ navigation }) {
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [duration, setDuration] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [photo, setPhoto] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { userToken } = useAuth()

  // Demander la permission et sélectionner une photo
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        alert("Nous avons besoin de votre permission pour accéder aux photos")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0])
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error)
      alert("Impossible de sélectionner l'image")
    }
  }

  // Upload de la photo sur le serveur
  const uploadPhoto = async () => {
    if (!photo) return null

    try {
      const formData = new FormData()

      if (Platform.OS === "web") {
        // For web, fetch the blob and create a File object
        const response = await fetch(photo.uri)
        const blob = await response.blob()
        const filename = photo.uri.split("/").pop() || "photo.jpg"
        const file = new File([blob], filename, { type: blob.type })
        formData.append("photo", file)
      } else {
        // For native platforms (iOS/Android)
        const filename = photo.uri.split("/").pop() || "photo.jpg"
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : "image/jpeg"

        formData.append("photo", {
          uri: photo.uri,
          type: type,
          name: filename,
        })
      }

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        return data.photoPath
      } else {
        throw new Error(data.error || "Erreur lors de l'upload")
      }
    } catch (error) {
      console.error("Erreur upload photo:", error)
      throw error
    }
  }

  // Créer la séance
  const handleSubmit = async () => {
    // Validation
    if (!name || !date || !duration) {
      const message = "Veuillez remplir tous les champs obligatoires (nom, date, durée)"
      if (Platform.OS === "web") {
        alert(message)
      } else {
        Alert.alert("Champs manquants", message)
      }
      return
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      const message = "Format de date invalide. Utilisez YYYY-MM-DD (ex: 2025-12-14)"
      if (Platform.OS === "web") {
        alert(message)
      } else {
        Alert.alert("Date invalide", message)
      }
      return
    }

    if (isNaN(duration) || Number.parseInt(duration) <= 0) {
      const message = "La durée doit être un nombre positif"
      if (Platform.OS === "web") {
        alert(message)
      } else {
        Alert.alert("Durée invalide", message)
      }
      return
    }

    setIsLoading(true)

    try {
      let photoPath = null
      if (photo) {
        photoPath = await uploadPhoto()
      }

      const response = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          date,
          duration: Number.parseInt(duration),
          location,
          notes,
          photoPath,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (Platform.OS === "web") {
          alert("Séance créée avec succès !")
        } else {
          Alert.alert("Succès", "Séance créée avec succès !")
        }
        navigation.goBack()
      } else {
        if (Platform.OS === "web") {
          alert(data.error || "Erreur lors de la création de la séance")
        } else {
          Alert.alert("Erreur", data.error || "Erreur lors de la création de la séance")
        }
      }
    } catch (error) {
      console.error("Submit error:", error)
      if (Platform.OS === "web") {
        alert("Impossible de créer la séance: " + error.message)
      } else {
        Alert.alert("Erreur", "Impossible de créer la séance: " + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Nom de la séance *</Text>
        <TextInput style={styles.input} placeholder="Ex: Séance bloc 6A" value={name} onChangeText={setName} />

        <Text style={styles.label}>Date *</Text>
        <TextInput style={styles.input} placeholder="YYYY-MM-DD (ex: 2025-12-14)" value={date} onChangeText={setDate} />

        <Text style={styles.label}>Durée (minutes) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 90"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Lieu</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ex: Salle Escal'Rock"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ex: Focus dévers"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Photo</Text>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>{photo ? "✓ Photo sélectionnée" : "📷 Ajouter une photo"}</Text>
        </TouchableOpacity>

        {photo && <Image source={{ uri: photo.uri }} style={styles.photoPreview} />}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Créer la séance</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  photoButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 5,
  },
  photoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#34C759",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})
