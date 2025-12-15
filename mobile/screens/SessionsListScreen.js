"use client"

// Écran affichant la liste des séances avec FlatList
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
  Platform,
} from "react-native"
import { useAuth } from "../App"
import { API_URL } from "../config"
import React from "react"

export default function SessionsListScreen({ navigation }) {
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const { userToken, signOut } = useAuth()

  // Fonction pour récupérer les séances
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setSessions(data.sessions)
      } else {
        Alert.alert("Erreur", data.error || "Erreur lors de la récupération des séances")
      }
    } catch (error) {
      console.error("Erreur:", error)
      Alert.alert("Erreur", "Impossible de se connecter au serveur")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchSessions()
  }, [])

  const handleDelete = async (sessionId, sessionName) => {
    // Utiliser Alert.alert sur mobile et window.confirm sur web
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Voulez-vous vraiment supprimer "${sessionName}" ?`)
      if (!confirmed) return

      await deleteSession(sessionId, sessionName)
    } else {
      Alert.alert("Confirmer la suppression", `Voulez-vous vraiment supprimer "${sessionName}" ?`, [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteSession(sessionId, sessionName),
        },
      ])
    }
  }

  const deleteSession = async (sessionId, sessionName) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        if (Platform.OS === "web") {
          alert("Séance supprimée avec succès")
        } else {
          Alert.alert("Succès", "Séance supprimée avec succès")
        }
        fetchSessions()
      } else {
        if (Platform.OS === "web") {
          alert(data.error || "Erreur lors de la suppression")
        } else {
          Alert.alert("Erreur", data.error || "Erreur lors de la suppression")
        }
      }
    } catch (error) {
      console.error("Delete error:", error)
      if (Platform.OS === "web") {
        alert("Impossible de supprimer la séance")
      } else {
        Alert.alert("Erreur", "Impossible de supprimer la séance")
      }
    }
  }

  const handleLogout = useCallback(() => {
    signOut()
  }, [signOut])

  // Navigation header boutons
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Déconnexion</Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation, handleLogout])

  // Charger les séances au montage du composant
  useEffect(() => {
    fetchSessions()
  }, [])

  // Recharger les séances quand on revient sur l'écran
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchSessions()
    })
    return unsubscribe
  }, [navigation])

  const SessionCard = React.memo(({ item, onDelete }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionName}>{item.name}</Text>
          <Text style={styles.sessionDate}>📅 {new Date(item.date).toLocaleDateString("fr-FR")}</Text>
          <Text style={styles.sessionDetail}>⏱️ {item.duration} minutes</Text>
          {item.location && <Text style={styles.sessionDetail}>📍 {item.location}</Text>}
        </View>

        {item.photo_path && <Image source={{ uri: `${API_URL}${item.photo_path}` }} style={styles.thumbnail} />}
      </View>

      {item.notes && (
        <Text style={styles.sessionNotes} numberOfLines={2}>
          💬 {item.notes}
        </Text>
      )}

      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id, item.name)}>
        <Text style={styles.deleteButtonText}>🗑️ Supprimer</Text>
      </TouchableOpacity>
    </View>
  ))

  const renderSession = ({ item }) => <SessionCard item={item} onDelete={handleDelete} />

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🧗</Text>
            <Text style={styles.emptyMessage}>Aucune séance enregistrée</Text>
            <Text style={styles.emptySubtext}>Appuyez sur le bouton + pour ajouter votre première séance</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddSession")}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  sessionDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  sessionDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  sessionNotes: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
    fontStyle: "italic",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ff3b30",
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
})
