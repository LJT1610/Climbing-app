# Rapport de Projet - Gestion de Séances d'Escalade

## 📖 Introduction

Ce projet est une application complète de gestion de séances d'escalade, composée d'une API REST backend et d'une application mobile React Native. L'objectif est de permettre aux utilisateurs de créer, consulter et supprimer leurs séances d'escalade avec photos.

---

## 🛠️ Stack Technique

### Backend
- **Node.js** : Environnement d'exécution JavaScript côté serveur
- **Express** : Framework web minimaliste pour Node.js
- **MySQL** : Système de gestion de base de données relationnelle
- **mysql2** : Client MySQL pour Node.js avec support des Promises
- **bcryptjs** : Librairie pour le hashage sécurisé des mots de passe
- **jsonwebtoken** : Implémentation JWT pour l'authentification
- **multer** : Middleware pour gérer l'upload de fichiers
- **cors** : Middleware pour gérer les requêtes cross-origin
- **dotenv** : Gestion des variables d'environnement

### Frontend Mobile
- **React Native** : Framework pour créer des applications mobiles natives
- **Expo** : Plateforme pour développer des applications React Native
- **React Navigation** : Navigation entre les écrans
- **expo-image-picker** : Sélection d'images depuis la galerie
- **expo-secure-store** : Stockage sécurisé des tokens
- **@react-native-async-storage** : Stockage local de données

---

## 🏗️ Architecture du Projet

### Backend (API REST)

#### Structure des dossiers
\`\`\`
backend/
├── db.js                 # Connexion à la base de données MySQL
├── models/               # Modèles de données
│   ├── userModel.js      # Logique métier utilisateurs
│   └── sessionModel.js   # Logique métier séances
├── routes/               # Définition des routes API
│   ├── auth.js          # Authentification (register/login)
│   ├── sessions.js      # CRUD séances
│   └── upload.js        # Upload de photos
├── middleware/           # Middlewares personnalisés
│   └── auth.js          # Vérification JWT
├── uploads/              # Stockage des photos
├── server.js             # Point d'entrée du serveur
├── .env                  # Variables d'environnement
└── package.json
\`\`\`

#### Base de données MySQL

**Table `users`** :
- `id` : Identifiant unique (clé primaire, auto-incrémenté)
- `email` : Email de l'utilisateur (unique)
- `password` : Mot de passe hashé avec bcrypt
- `created_at` : Date de création du compte

**Table `sessions`** :
- `id` : Identifiant unique (clé primaire, auto-incrémenté)
- `user_id` : Référence vers l'utilisateur (clé étrangère)
- `name` : Nom de la séance
- `date` : Date de la séance
- `duration` : Durée en minutes
- `location` : Lieu de la séance (optionnel)
- `notes` : Notes personnelles (optionnel)
- `photo_path` : Chemin vers la photo (optionnel)
- `created_at` : Date de création de l'enregistrement

**Relations** :
- Un utilisateur peut avoir plusieurs séances (1:N)
- Clé étrangère avec `ON DELETE CASCADE` : la suppression d'un utilisateur supprime ses séances

#### Endpoints API

**Authentification** :
- `POST /api/auth/register` : Inscription d'un nouvel utilisateur
- `POST /api/auth/login` : Connexion et récupération du token JWT

**Séances** (routes protégées par JWT) :
- `GET /api/sessions` : Récupérer toutes les séances de l'utilisateur
- `GET /api/sessions/:id` : Récupérer une séance spécifique
- `POST /api/sessions` : Créer une nouvelle séance
- `PUT /api/sessions/:id` : Modifier une séance existante
- `DELETE /api/sessions/:id` : Supprimer une séance

**Upload** :
- `POST /api/upload` : Upload d'une photo (route protégée)

### Frontend Mobile (React Native)

#### Structure des dossiers
\`\`\`
mobile/
├── App.js                        # Navigation et AuthContext
├── screens/                      # Écrans de l'application
│   ├── LoginScreen.js           # Connexion/Inscription
│   ├── SessionsListScreen.js    # Liste des séances
│   └── AddSessionScreen.js      # Ajout de séance
├── config.js                     # Configuration API URL
└── package.json
\`\`\`

#### Navigation
- **Stack Navigation** : Navigation entre les écrans
- **Conditional Rendering** : Affichage conditionnel basé sur l'état d'authentification
- **AuthContext** : Contexte React pour gérer l'état de connexion global

#### Écrans
1. **LoginScreen** : Authentification (connexion/inscription)
2. **SessionsListScreen** : Liste des séances avec FlatList
3. **AddSessionScreen** : Formulaire d'ajout de séance avec ImagePicker

---

## 🔐 Sécurité

### Authentification JWT
- Les mots de passe sont hashés avec bcrypt (10 rounds de salt)
- Les tokens JWT sont signés avec un secret défini dans `.env`
- Les tokens ont une durée de validité de 7 jours
- Les tokens sont stockés de manière sécurisée avec `expo-secure-store`

### Protection des routes
- Middleware `authMiddleware` vérifie le token JWT sur toutes les routes `/api/sessions`
- Les utilisateurs ne peuvent accéder qu'à leurs propres séances
- Vérification du `user_id` dans toutes les opérations CRUD

### Upload de fichiers
- Filtre de type de fichier (images uniquement : JPG, PNG, GIF)
- Limite de taille de fichier : 5 MB
- Noms de fichiers uniques générés avec timestamp
- Stockage dans un dossier dédié (`uploads/`)

---

## 📸 Gestion des Photos

### Côté Backend (Multer)
- Configuration de `multer.diskStorage` pour définir la destination et le nom de fichier
- Génération de noms uniques : `session_[timestamp]-[random].[extension]`
- Validation du type MIME (images seulement)
- Stockage dans le dossier `backend/uploads/`
- Chemin relatif stocké en base de données

### Côté Mobile (Expo ImagePicker)
- Demande de permission pour accéder à la galerie photos
- Sélection d'image avec recadrage possible (aspect 4:3)
- Compression de l'image (qualité 0.8)
- Upload via FormData avec `multipart/form-data`
- Affichage de la miniature dans la liste des séances

---

## 🎨 Interface Utilisateur (UX/UI)

### Design
- **Couleur principale** : Bleu (#007AFF) pour les actions principales
- **Couleur succès** : Vert (#34C759) pour la création de séances
- **Couleur danger** : Rouge (#ff3b30) pour les suppressions
- **Fond** : Gris clair (#f5f5f5) pour un contraste agréable

### Fonctionnalités UX
- **ActivityIndicator** : Loaders pendant les requêtes API
- **Pull to Refresh** : Rafraîchissement de la liste des séances
- **Alert** : Confirmations pour les actions sensibles (suppression, déconnexion)
- **FloatingActionButton** : Bouton "+" pour ajouter une séance facilement
- **Empty State** : Message informatif quand aucune séance n'existe
- **Validation** : Messages d'erreur clairs pour les formulaires

---

## 🔄 Flux de Données

### Flux d'authentification
1. L'utilisateur s'inscrit ou se connecte
2. Le backend vérifie les identifiants et génère un JWT
3. Le frontend stocke le token dans SecureStore
4. Le token est inclus dans le header `Authorization` de chaque requête
5. Le middleware backend vérifie et décode le token
6. L'utilisateur est authentifié et a accès aux routes protégées

### Flux de création de séance
1. L'utilisateur remplit le formulaire et sélectionne une photo
2. La photo est uploadée via `POST /api/upload`
3. Le backend retourne le chemin de la photo
4. Les données de la séance (avec `photoPath`) sont envoyées via `POST /api/sessions`
5. Le backend insère la séance en base de données
6. Le frontend affiche un message de succès et retourne à la liste
7. La liste est rechargée automatiquement

### Flux de suppression de séance
1. L'utilisateur clique sur "Supprimer"
2. Une alerte de confirmation s'affiche
3. Si confirmé, une requête `DELETE /api/sessions/:id` est envoyée
4. Le backend vérifie que la séance appartient à l'utilisateur
5. La photo est supprimée du serveur (si elle existe)
6. La séance est supprimée de la base de données
7. Le frontend recharge la liste des séances

---

## 🧪 Tests et Validation

### Tests manuels effectués

#### Backend
✅ Inscription d'un utilisateur  
✅ Connexion avec identifiants valides  
✅ Rejet de connexion avec identifiants invalides  
✅ Protection des routes avec JWT  
✅ Création de séance avec et sans photo  
✅ Récupération des séances d'un utilisateur  
✅ Modification d'une séance  
✅ Suppression d'une séance et de sa photo  
✅ Validation des données (champs requis, format email, etc.)  

#### Frontend Mobile
✅ Inscription et connexion  
✅ Stockage et récupération du token  
✅ Affichage de la liste des séances  
✅ Pull to refresh  
✅ Ajout de séance avec formulaire  
✅ Sélection et upload de photo  
✅ Affichage des miniatures  
✅ Suppression avec confirmation  
✅ Déconnexion  
✅ Navigation entre les écrans  

---

## 📊 Diagrammes

### Schéma de la base de données

\`\`\`
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ password            │
│ created_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐
│     sessions        │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ name                │
│ date                │
│ duration            │
│ location            │
│ notes               │
│ photo_path          │
│ created_at          │
└─────────────────────┘
\`\`\`

### Architecture Globale

\`\`\`
┌──────────────────────────────────────┐
│      Application Mobile              │
│       (React Native + Expo)          │
│                                      │
│  ┌────────────┐  ┌────────────┐    │
│  │   Login    │  │  Sessions  │    │
│  │   Screen   │  │   List     │    │
│  └────────────┘  └────────────┘    │
│         │               │            │
│         └───────┬───────┘            │
│                 │                    │
│         ┌───────▼────────┐          │
│         │  AuthContext   │          │
│         │  (JWT Token)   │          │
│         └───────┬────────┘          │
└─────────────────┼────────────────────┘
                  │
                  │ HTTP/REST
                  │ (Authorization: Bearer TOKEN)
                  │
┌─────────────────▼────────────────────┐
│        API Backend                   │
│    (Node.js + Express)               │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Middleware Auth (JWT)       │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │  Routes  │  │  Models  │        │
│  │  Auth    │  │  User    │        │
│  │ Sessions │  │ Session  │        │
│  │  Upload  │  │          │        │
│  └─────┬────┘  └────┬─────┘        │
│        │            │               │
│        └─────┬──────┘               │
└──────────────┼──────────────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼──────────────────────┐
│      Base de Données MySQL          │
│                                      │
│  ┌────────┐      ┌──────────┐      │
│  │ users  │──1:N─│ sessions │      │
│  └────────┘      └──────────┘      │
└─────────────────────────────────────┘
\`\`\`

---

## 🚀 Améliorations Possibles

### Fonctionnalités
- [ ] Modification de séances existantes (PUT)
- [ ] Filtre et recherche de séances par date/lieu
- [ ] Statistiques (nombre de séances, durée totale, etc.)
- [ ] Partage de séances avec d'autres utilisateurs
- [ ] Système de tags/catégories pour les séances
- [ ] Mode hors-ligne avec synchronisation

### Sécurité
- [ ] Refresh token pour prolonger l'authentification
- [ ] Rate limiting sur les routes sensibles
- [ ] Validation côté serveur plus stricte (ajout de Joi ou express-validator)
- [ ] Chiffrement des données sensibles en base

### Performance
- [ ] Pagination de la liste des séances
- [ ] Cache des images avec React Query
- [ ] Optimisation des requêtes SQL (indexes, jointures)
- [ ] Compression des images côté mobile avant upload

### UX/UI
- [ ] Thème sombre
- [ ] Animations de transition
- [ ] Sélection de date avec DatePicker
- [ ] Appareil photo intégré (pas seulement la galerie)
- [ ] Galerie de photos multiples par séance

---

## 📝 Conclusion

Ce projet démontre la mise en place d'une application full-stack moderne avec :
- Une API RESTful sécurisée avec Node.js, Express et MySQL
- Une authentification JWT robuste avec bcrypt
- Un système d'upload de fichiers avec Multer
- Une application mobile React Native avec Expo
- Une navigation et gestion d'état avec React Navigation et Context API
- Une intégration complète entre le backend et le frontend

Le code est structuré, commenté et suit les bonnes pratiques de développement. L'application est fonctionnelle et peut servir de base solide pour un projet d'escalade plus complet.

---

## 📸 Captures d'écran

*Note : Ajoutez ici des captures d'écran de votre application mobile :*
- Écran de connexion
- Liste des séances avec photos
- Formulaire d'ajout de séance
- Confirmation de suppression
- État vide (aucune séance)

---

## 👨‍💻 Auteur

**Projet d'école** - Gestion de Séances d'Escalade  
Stack : Node.js + Express + MySQL + React Native + Expo  
Date : Décembre 2025
