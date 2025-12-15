# Guide d'Installation - Gestion de Séances d'Escalade

## 📋 Prérequis

### Backend
- Node.js (version 14 ou supérieure)
- MySQL (version 5.7 ou supérieure)
- npm ou yarn

### Frontend Mobile
- Node.js (version 14 ou supérieure)
- Expo CLI
- Un émulateur Android/iOS ou un appareil physique avec Expo Go

---

## 🔧 Installation du Backend (API Node.js + Express + MySQL)

### Étape 1 : Configuration de MySQL

1. **Créer la base de données** :
   \`\`\`sql
   CREATE DATABASE climbing_sessions;
   USE climbing_sessions;
   \`\`\`

2. **Exécuter le script SQL** :
   - Ouvrez le fichier `scripts/01_create_tables.sql`
   - Copiez le contenu et exécutez-le dans MySQL Workbench ou dans le terminal MySQL
   - Ou exécutez directement : `mysql -u root -p climbing_sessions < scripts/01_create_tables.sql`

### Étape 2 : Configuration du Backend

1. **Naviguer vers le dossier backend** :
   \`\`\`bash
   cd backend
   \`\`\`

2. **Installer les dépendances** :
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurer les variables d'environnement** :
   - Créez un fichier `.env` à la racine du dossier `backend`
   - Copiez le contenu de `.env.example` et modifiez les valeurs :
   \`\`\`env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe_mysql
   DB_NAME=climbing_sessions
   JWT_SECRET=votre_secret_jwt_super_securise_changez_moi
   PORT=3000
   \`\`\`

4. **Démarrer le serveur** :
   \`\`\`bash
   npm start
   \`\`\`
   
   Le serveur démarrera sur `http://localhost:3000`

5. **Tester l'API** :
   - Ouvrez votre navigateur et accédez à `http://localhost:3000/api/health`
   - Vous devriez voir : `{"status":"OK","message":"API de gestion de séances d'escalade"}`

---

## 📱 Installation du Frontend (Application Mobile React Native)

### Étape 1 : Configuration de l'application mobile

1. **Naviguer vers le dossier mobile** :
   \`\`\`bash
   cd mobile
   \`\`\`

2. **Installer les dépendances** :
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurer l'URL de l'API** :
   - Ouvrez le fichier `mobile/config.js`
   - Modifiez `API_URL` selon votre configuration :
   
   **Pour émulateur Android** :
   \`\`\`javascript
   export const API_URL = 'http://10.0.2.2:3000';
   \`\`\`
   
   **Pour émulateur iOS ou appareil physique** :
   \`\`\`javascript
   export const API_URL = 'http://VOTRE_IP_LOCALE:3000';
   \`\`\`
   Pour trouver votre IP locale :
   - Windows : `ipconfig` dans le terminal
   - Mac/Linux : `ifconfig` dans le terminal
   - Cherchez l'adresse IPv4 (ex: 192.168.1.10)

### Étape 2 : Démarrer l'application

1. **Démarrer Expo** :
   \`\`\`bash
   npx expo start
   \`\`\`

2. **Lancer l'application** :
   - **Sur émulateur Android** : Appuyez sur `a` dans le terminal
   - **Sur émulateur iOS** : Appuyez sur `i` dans le terminal
   - **Sur appareil physique** : Scannez le QR code avec l'application Expo Go

---

## 🧪 Test de l'Application

### Test avec Postman (API Backend)

1. **Inscription** :
   - Méthode : POST
   - URL : `http://localhost:3000/api/auth/register`
   - Body (JSON) :
   \`\`\`json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   \`\`\`

2. **Connexion** :
   - Méthode : POST
   - URL : `http://localhost:3000/api/auth/login`
   - Body (JSON) :
   \`\`\`json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   \`\`\`
   - Récupérez le `token` dans la réponse

3. **Créer une séance** :
   - Méthode : POST
   - URL : `http://localhost:3000/api/sessions`
   - Headers : `Authorization: Bearer VOTRE_TOKEN`
   - Body (JSON) :
   \`\`\`json
   {
     "name": "Séance bloc 6A",
     "date": "2025-12-14",
     "duration": 90,
     "location": "Salle Escal'Rock",
     "notes": "Focus dévers"
   }
   \`\`\`

4. **Récupérer toutes les séances** :
   - Méthode : GET
   - URL : `http://localhost:3000/api/sessions`
   - Headers : `Authorization: Bearer VOTRE_TOKEN`

### Test de l'Application Mobile

1. **Inscription** :
   - Ouvrez l'application
   - Cliquez sur "Pas encore de compte ? S'inscrire"
   - Entrez un email et un mot de passe (min 6 caractères)
   - Cliquez sur "S'inscrire"

2. **Connexion** :
   - Entrez vos identifiants
   - Cliquez sur "Se connecter"

3. **Ajouter une séance** :
   - Cliquez sur le bouton "+" en bas à droite
   - Remplissez le formulaire
   - Ajoutez une photo (optionnel)
   - Cliquez sur "Créer la séance"

4. **Supprimer une séance** :
   - Sur la liste des séances, cliquez sur le bouton "Supprimer"
   - Confirmez la suppression

---

## 🚨 Dépannage

### Backend

**Erreur de connexion MySQL** :
- Vérifiez que MySQL est démarré : `sudo service mysql start` (Linux) ou via les Services Windows
- Vérifiez les identifiants dans le fichier `.env`
- Vérifiez que la base de données `climbing_sessions` existe

**Port déjà utilisé** :
- Changez le port dans le fichier `.env` : `PORT=3001`
- Ou arrêtez le processus utilisant le port 3000

### Frontend Mobile

**Impossible de se connecter à l'API** :
- Vérifiez que le backend est bien démarré
- Vérifiez l'URL dans `mobile/config.js`
- Sur appareil physique, assurez-vous d'être sur le même réseau WiFi

**Erreur d'upload de photo** :
- Vérifiez que le dossier `backend/uploads` existe
- Vérifiez les permissions du dossier : `chmod 755 backend/uploads`

---

## 📚 Structure des Projets

### Backend
\`\`\`
backend/
├── db.js                 # Connexion MySQL
├── models/
│   ├── userModel.js      # Gestion utilisateurs
│   └── sessionModel.js   # Gestion séances
├── routes/
│   ├── auth.js          # Routes authentification
│   ├── sessions.js      # Routes CRUD séances
│   └── upload.js        # Route upload photos
├── middleware/
│   └── auth.js          # Middleware JWT
├── uploads/             # Dossier photos
├── server.js            # Serveur principal
├── .env                 # Variables d'environnement
└── package.json
\`\`\`

### Frontend Mobile
\`\`\`
mobile/
├── App.js                        # Navigation + AuthContext
├── screens/
│   ├── LoginScreen.js           # Écran connexion
│   ├── SessionsListScreen.js    # Liste des séances
│   └── AddSessionScreen.js      # Ajout de séance
├── config.js                     # Configuration API
└── package.json
\`\`\`

---

## ✅ Vérification finale

- [ ] Backend démarré sur le port 3000
- [ ] Base de données créée et tables initialisées
- [ ] Test de l'API avec Postman réussi
- [ ] Frontend mobile démarré avec Expo
- [ ] Inscription et connexion fonctionnelles
- [ ] Ajout/suppression de séances fonctionnels
- [ ] Upload de photos fonctionnel

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs du backend dans le terminal
2. Vérifiez les logs du frontend dans la console Expo
3. Vérifiez que toutes les dépendances sont installées
4. Consultez la documentation officielle :
   - [Express](https://expressjs.com/)
   - [React Native](https://reactnative.dev/)
   - [Expo](https://docs.expo.dev/)
