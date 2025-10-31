import { Questions } from '../models/Questions.js';

export class QuizService {
    static baseUrl = 'https://opentdb.com/';
    static cache = new Map();

    //Gestion des response code retourné par l'API
    static handleResponseCode(responseCode, data) {
        switch (responseCode) {
            case 0:
                return {
                    status: "success",
                    questions: data.results.map(q => new Questions(q))
                };
            case 1:
                return { status: "error", message: "Pas assez de questions disponibles pour cette configuration. Essayez de réduire le nombre ou de changer les paramètres." };
            case 2:
                return { status: "error", message: "Paramètres invalides. Vérifiez que vous avez bien rempli tous les champs correctement." };
            case 3:
                return { status: "error", message: "Erreur de session. Le jeton de session est invalide ou expiré." };
            case 4:
                return { status: "error", message: "Toutes les questions possibles ont déjà été utilisées. Veuillez réinitialiser le quiz." };
            case 5:
                return { status: "error", message: "Trop de requêtes. Veuillez patienter quelques secondes avant de réessayer." };
            default:
                return { status: "error", message: `Erreur inconnue. Code : ${responseCode}` };
        }
    }

    static async fetchQuestions(config) {
        const cacheKey = `list_${config.amount}_${config.category}_${config.difficulty}_${config.type}`;

        if (this.cache.has(cacheKey)) {
            const cachedData = this.cache.get(cacheKey);
            return this.handleResponseCode(cachedData.response_code, cachedData);
        }

        try {
            const url = `${this.baseUrl}api.php?amount=${config.amount}`
                + (config.category !== "any" ? `&category=${config.category}` : '')
                + (config.difficulty !== "any" ? `&difficulty=${config.difficulty}` : '')
                + (config.type !== "any" ? `&type=${config.type}` : '');
            
            const response = await fetch(url);
            const data = await response.json();
            this.cache.set(cacheKey, data);

            return this.handleResponseCode(data.response_code, data);
        } catch (error) {
            console.error('Erreur lors de la récupération des questions:', error);
            return { status: "error", message: "Erreur réseau ou serveur." };
        }
    }


    static async fetchCategories() {
        const cacheKey = `list_trivia_categories`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const url = `${this.baseUrl}api_category.php`;
            const response = await fetch(url);
            const data = await response.json();
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la liste des catégories:', error);
            throw error;           
        }
    }

    static async fetchNbrQuestions(categorie) {
        const cacheKey = `list_category_${categorie}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const url = `${this.baseUrl}api_count.php?category=${categorie}`;
            const response = await fetch(url);
            const data = await response.json();
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la liste de nombres de questions:', error);
            throw error;           
        }
    }    
}
