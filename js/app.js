import { QuizController } from './controllers/QuizController.js';

/**
 * Point d'entrée de l'application
 */
class App {
    constructor() {
        this.controller = null;
    }

    /**
     * Initialise l'application
     */
    async init() {
        try {
            console.log('🎮 Initialisation du Quiz...');

            // Créer et initialiser le contrôleur
            this.controller = new QuizController();
            await this.controller.init();

            console.log('✅ Quiz prêt !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de l\'application:', error);
            this.showCriticalError();
        }
    }

    /**
     * Affiche une erreur critique
     */
    showCriticalError() {
        const errorElement = document.getElementById('error');
        if (errorElement) {
            errorElement.textContent = 'Une erreur critique est survenue. Veuillez rafraîchir la page.';
            errorElement.classList.remove('hidden');
        }
    }
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});