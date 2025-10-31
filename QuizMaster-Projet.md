# QuizMaster – Jeu de quiz en ligne 🎮

## 🎯 Objectif

Développer une application web de quiz interactif en utilisant l'architecture Model-Service-Controller et une API externe pour récupérer les questions. 
Ce projet permet de mettre en pratique les concepts de programmation orientée objet, la consommation d'API REST, et la structuration d'une application web moderne.

## 🧠 Compétences visées

- ✅ Maîtriser l'architecture Model-Service-Controller en JavaScript
- ✅ Consommer une API REST externe
- ✅ Manipuler le DOM de manière structurée
- ✅ Gérer les états d'une application
- ✅ Implémenter une interface utilisateur responsive
- ✅ Gérer les erreurs et les cas limites
- ✅ Organiser et structurer son code

## 🛠️ Technologies utilisées

| Technologie | Usage |
|-------------|-------|
| **HTML5** | Structure de l'application |
| **CSS3** ou **Tailwind CSS** | Stylisation et responsive design |
| **JavaScript ES6+** | Logique métier et architecture Model-Service-Controller |
| **Fetch API** | Consommation de l'API externe |
| **Open Trivia Database API** | Source des questions de quiz |

## 🗂️ Structure Model-Service-Controller attendue

```
QuizMaster/
├── index.html
├── css/
│   └── style.css (ou utilisation de Tailwind CDN)
├── js/
│   ├── models/
│   │   ├── Quiz.js
│   │   └── Question.js
│   ├── services/
│   │   └── QuizService.js
│   ├── controllers/
│   │   └── QuizController.js
│   └── app.js
└── README.md
```

### 📋 Rôles de chaque couche :

| Couche | Responsabilité | Exemples |
|--------|---------------|----------|
| **Models** | Représentation des données et logique métier | `Quiz.js`, `Question.js` |
| **Services** | Communication avec l'API et gestion des données | `QuizService.js` |
| **Controllers** | Orchestration entre models, services et DOM | `QuizController.js` |

## 📅 Planning sur 2 jours

### Jour 1 🌅
- **Matin (3h)**
  - [ ] Setup du projet et structure des fichiers
  - [ ] Création des modèles (Quiz, Question)
  - [ ] Implémentation du service API (QuizService)
  - [ ] Tests de récupération des données

- **Après-midi (3h)**
  - [ ] Développement du contrôleur principal
  - [ ] Intégration Model-Service-Controller
  - [ ] Interface utilisateur de base (HTML/CSS)
  - [ ] Affichage des premières questions

### Jour 2 🌄
- **Matin (3h)**
  - [ ] Gestion des réponses et scoring
  - [ ] Système de navigation entre questions
  - [ ] Affichage des résultats finaux
  - [ ] Gestion des erreurs dans le service

- **Après-midi (3h)**
  - [ ] Stylisation et responsive design
  - [ ] Fonctionnalités bonus
  - [ ] Tests et débogage
  - [ ] Finalisation et présentation

## 🔗 API à utiliser

**Open Trivia Database** : [https://opentdb.com/](https://opentdb.com/)

### Exemple d'URL d'API :
```
https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple
```

### Paramètres disponibles :
- `amount` : Nombre de questions (1-50)
- `category` : Catégorie (9=General Knowledge, 17=Science, etc.)
- `difficulty` : easy, medium, hard
- `type` : multiple, boolean

### Exemple de réponse JSON :
```json
{
  "response_code": 0,
  "results": [
    {
      "category": "General Knowledge",
      "type": "multiple",
      "difficulty": "easy",
      "question": "What is the capital of France?",
      "correct_answer": "Paris",
      "incorrect_answers": ["London", "Berlin", "Madrid"]
    }
  ]
}
```

## ✅ Fonctionnalités obligatoires

### 🎯 Fonctionnalités de base
- [ ] **Configuration du quiz** : Choisir le nombre de questions, catégorie, difficulté
- [ ] **Affichage des questions** : Une question à la fois avec les choix multiples
- [ ] **Gestion des réponses** : Sélection et validation des réponses
- [ ] **Système de score** : Calcul et affichage du score en temps réel
- [ ] **Navigation** : Boutons "Suivant" et "Précédent"
- [ ] **Résultats finaux** : Récapitulatif avec score final et pourcentage

### 🔧 Fonctionnalités techniques
- [ ] **Architecture Model-Service-Controller** respectée
- [ ] **Gestion d'erreurs** pour les appels API dans le service
- [ ] **Interface responsive** (mobile-friendly)
- [ ] **Code modulaire** et commenté
- [ ] **Séparation des responsabilités** entre les couches

## 🎁 Bonus (facultatifs)

- [ ] **Timer** : Temps limité par question ou pour le quiz entier
- [ ] **Sauvegarde locale** : LocalStorage pour sauvegarder les scores
- [ ] **Historique** : Affichage des derniers scores
- [ ] **Animations** : Transitions fluides entre questions
- [ ] **Sons** : Effets sonores pour bonnes/mauvaises réponses
- [ ] **Thèmes** : Mode sombre/clair
- [ ] **Statistiques** : Graphiques de performance par catégorie
- [ ] **Partage** : Partage des résultats sur les réseaux sociaux
- [ ] **Cache** : Mise en cache des questions dans le service

## 📊 Critères d'évaluation

| Critère | Points | Description |
|---------|--------|-------------|
| **Architecture Model-Service-Controller** | /4 | Respect de la séparation des responsabilités |
| **Fonctionnalités** | /4 | Implémentation des fonctionnalités obligatoires |
| **Qualité du code** | /3 | Lisibilité, organisation, commentaires |
| **Interface utilisateur** | /3 | Design, ergonomie, responsive |
| **Gestion d'erreurs** | /2 | Robustesse de l'application et du service |
| **Fonctionnalités bonus** | /4 | Créativité et fonctionnalités supplémentaires |

**Total : /20**

## 🧪 Exemple de rendu attendu

### Interface de configuration :
```
🎮 QuizMaster

Configurez votre quiz :
- Nombre de questions : [10 ▼]
- Catégorie : [Culture générale ▼]
- Difficulté : [Facile ▼]

[🚀 Commencer le quiz]
```

### Interface de jeu :
```
Question 3/10                                    Score: 2/2

📚 Culture générale - Facile

Quelle est la capitale de la France ?

○ London
● Paris
○ Berlin  
○ Madrid

[← Précédent]  [Suivant →]
```

### Interface de résultats :
```
🎉 Quiz terminé !

Votre score : 8/10 (80%)

📊 Détails :
✅ Bonnes réponses : 8
❌ Mauvaises réponses : 2
⏱️ Temps total : 5min 23s

[🔄 Nouveau quiz]  [📋 Voir l'historique]
```

## 💡 Structure de code suggérée

### Models/Quiz.js
```javascript
class Quiz {
    constructor(questions = []) {
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.score = 0;
        // ...
    }
    
    getCurrentQuestion() { /* ... */ }
    submitAnswer(answer) { /* ... */ }
    // ...
}
```

### Services/QuizService.js
```javascript
class QuizService {
    static async fetchQuestions(amount, category, difficulty) {
        // Appel API
        // Gestion des erreurs
        // Retour des données formatées
    }
}
```

### Controllers/QuizController.js
```javascript
class QuizController {
    constructor() {
        this.quiz = null;
        this.initEventListeners();
    }
    
    async startQuiz(config) {
        // Utilise QuizService pour récupérer les questions
        // Crée un nouveau Quiz
        // Met à jour l'interface
    }
    // ...
}
```

---

**Bon développement ! 🚀**