import { QuizService } from '../services/QuizService.js';
import { Quiz } from '../models/Quiz.js';


// To DO fix softlock si on reponds à la dernière question avec au moins un des questions précédentes non répondus

export class QuizController {
    constructor() {
        this.quiz = null;
        this.categories = [];
        this.pageIndex = 1;
        this.config = {};
        this.maxCallQuestion = 50;
        this.duration = 5 * 60; // 5 minutes
        this.timeRemaining = 0;
        this.isChangingPage = false;
        this.isTimerEnabled = false;
        this.selectedAnswer = null;

        // Éléments du DOM
        this.questionTxt = document.getElementById("question");
        this.answersContainer = document.querySelector('#answers');
        this.scoreTxt = document.getElementById("score");
        this.pageTxt = document.getElementById("page");
        this.maxPageTxt = document.getElementById("max-page");
        this.prev = document.getElementById("prev");
        this.next = document.getElementById("next");
        this.maxScoreTxt = document.getElementById("max-score");
        this.themeToggle = document.getElementById("theme-toggle");
        this.timerElement = document.getElementById("timer");
        this.timerChoice = document.getElementById("choix-timer");
        this.nbrCat = document.getElementById("nbr-c");
        this.nbrQue = document.getElementById("nbr-q");
        this.difficulty = document.getElementById("difficulty");
        this.type = document.getElementById("type");
        this.startButton = document.getElementById("start-quiz");
        this.errorDiv = document.getElementById("error-message");
        this.openModalBtn = document.getElementById("open-modal");
        this.modal = document.getElementById("results-modal");
        this.closeBtn = document.querySelector(".close");
        this.resultsTableBody = document.querySelector("#results-table tbody");
        this.sectionConfig = document.querySelector(".section-config");
        this.sectionQuiz = document.querySelector('.section-quiz');
        this.sectionResult = document.querySelector('.section-result');
        this.newQuiz = document.getElementById('new-quiz');
        this.showHistory = document.getElementById('show-history');
        this.correctAnswersTxt = document.getElementById("correct-answers");
        this.incorrectAnswersTxt = document.getElementById("incorrect-answers");
        this.totalTimeTxt = document.getElementById("total-time");
        this.scoreValueTxt = document.getElementById("score-value");
        this.scoreMaxTxt = document.getElementById("score-max");
        this.scorePerTxt = document.getElementById("score-per");

        this.initEventListeners();
    }

    // Initialise les écouteurs d'événements
    initEventListeners() {
        this.startButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.timerElement.textContent = "Ready...Go!";
            this.config = {
                type: this.type.value,
                difficulty: this.difficulty.value,
                category: this.nbrCat.value,
                amount: this.nbrQue.value
            };
            this.startQuiz(this.config);
        });

		// Input nombre de questions							
        this.nbrQue.addEventListener("input", () => {
            this.checkMinMaxQuestions(this.nbrCat.value);
        });

		// Changement de catégorie						   
        this.nbrCat.addEventListener("change", (event) => {
            this.checkMinMaxQuestions(event.target.value);
        });

		// Changement de difficulté							
        this.difficulty.addEventListener("change", () => {
            this.checkMinMaxQuestions(this.nbrCat.value);
        });

		// Changement de thème					   
        this.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            this.themeToggle.textContent = isDark ? "☀️ Mode clair" : "🌓 Mode sombre";
			// Sauvegarde le choix dans le navigateur										 
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });

        this.answersContainer.addEventListener('click', (event) => this.handleAnswerSelection(event));

        // TODO : gérer les limites de navigation (désactivation visuelle, feedback utilisateur)
        this.next.addEventListener('click', () => this.handleNextClick()); // Button next
        this.prev.addEventListener('click', () => this.handlePrevClick()); // Button prev

		// New game 			
        this.newQuiz.addEventListener('click', () => {
            this.quizReset();
            this.renderInterface(this.sectionResult, this.sectionConfig);
        });

		// Show history en Modal						
        this.showHistory.addEventListener('click', () => {
            this.openModal();
            this.modal.classList.remove("hidden");
        });

		//Fermeture Modal				 
        this.closeBtn.addEventListener("click", () => {
            this.modal.classList.add("hidden");
        });

        window.addEventListener("click", (e) => {
            if (e.target === this.modal) {
                this.modal.classList.add("hidden");
            }
        });
    }

    handleAnswerSelection(event) {
        const btn = event.target.closest('button');
        if (!btn || btn.disabled) return;

        this.answersContainer.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedAnswer = btn.id;
    }

    handleNextClick() {
        if (this.next.disabled || this.isChangingPage) return;

        const selected = [...document.querySelectorAll('#answers button')]
            .find(btn => btn.classList.contains("selected"))?.id;

        const currentIndex = this.quiz.currentQuestionIndex;
        const isLast = currentIndex === this.quiz.questions.length - 1;
        const alreadyAnswered = this.quiz.isQuestionAnswered(currentIndex);

        // Soumettre la réponse si elle n'a pas encore été donnée
        if (selected && !alreadyAnswered) {
            this.selectedAnswer = selected;
            this.quiz.submitAnswer(selected);
        }

        const unanswered = this.quiz.getUnansweredQuestions();

        // Si toutes les questions ont été répondues → fin du quiz
        if (this.quiz.isComplete()) {
            this.isChangingPage = true;
            this.animateContainer('next', async () => {
                await this.endQuiz();
                this.isChangingPage = false;
            }, true);
            return;
        }

        // Si on est sur la dernière question mais qu'il reste des questions non répondues
        if (isLast && unanswered.length > 0) {
            this.isChangingPage = true;

            // Affiche un message d'erreur
            const msg = unanswered.length > 1
                ? `Vous n'avez pas répondu aux questions : ${unanswered.map(i => i + 1).join(', ')}`
                : `Vous n'avez pas répondu à la question : ${unanswered[0] + 1}`;
            this.showError(msg);

            // Animation de sortie, puis chargement de la question non répondue
            setTimeout(() => {
                this.animateContainer('next', () => {
                    this.quiz.currentQuestionIndex = unanswered[0];
                    this.quiz.loadQuestion();
                    this.isChangingPage = false;
                });
            }, 1000);

            return;
        }

        if (isLast && unanswered.length === 0) {
            this.isChangingPage = true;

            setTimeout(() => {
                this.animateContainer('next', async () => {
                    // Vider le contenu pour la "page blanche"
                    this.sectionQuiz.innerHTML = '';
                    await this.endQuiz();
                    this.isChangingPage = false;
                }, true); // le "true" force la sortie et empêche l'entrée
                return;
            }, 300);
        }

        // Navigation normale
        this.delayedPageChange("next");
    }

    handlePrevClick() {
    if (this.prev.disabled || this.isChangingPage) return;
        this.changePageWithAnimation("prev");
    }

    changePageWithAnimation(direction) {
        this.isChangingPage = true;
        this.animateContainer(direction, () => {
            this.quiz.changePage(direction);
            this.isChangingPage = false;
        });
    }

    delayedPageChange(direction) {
        this.isChangingPage = true;
        setTimeout(() => {
            this.changePageWithAnimation(direction);
        }, 1000);
    }

    async getCategories() {
		// Utilise QuizService pour récupérer les categories													  
        try {
            const result = await QuizService.fetchCategories();

            if (result.status === "error") {
                this.showError(result.message);
                return;
            }

            if (!Array.isArray(result.trivia_categories)) {
                this.showError("Catégories invalides");
                return;
            }

			// Ajout des catégories dans le select									   
            result.trivia_categories.forEach(category => {
                const catOptions = document.createElement("option");
                catOptions.value = category.id;
                catOptions.text = category.name;
                this.nbrCat.appendChild(catOptions);
            });

        } catch (error) {
            console.error(error);
        }
    }

    formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}min ${sec}s`;
    }

    calculateScoreStats() {
        const score = this.quiz.getScore();
        const maxScore = this.config.amount;
        const incorrectAnswers = maxScore - score;
        const timeLeft = this.duration - this.timeRemaining;
        const scorePercentage = Math.round((score / maxScore) * 100);

        return { score, maxScore, incorrectAnswers, timeLeft, scorePercentage };
    }

    async endQuiz() {
        this.quiz.saveQuizResult(); // On save en local le score
        const { score, maxScore, incorrectAnswers, timeLeft, scorePercentage } = this.calculateScoreStats();

        // Mise à jour des éléments HTML
        this.correctAnswersTxt.textContent = score;
        this.incorrectAnswersTxt.textContent = incorrectAnswers;
        this.totalTimeTxt.textContent = this.isTimerEnabled ? this.formatTime(timeLeft) : "∞";
        this.scoreValueTxt.textContent = score;
        this.scoreMaxTxt.textContent = maxScore;
        this.scorePerTxt.textContent = scorePercentage;

        this.renderInterface(this.sectionQuiz, this.sectionResult);
        //console.table(this.quiz.results); // Pour debug
    }
async startQuiz(config) {
    this.clearError();
    try {
        const result = await QuizService.fetchQuestions(config);

        if (result.status === "error") {
            this.showError(result.message);
            return;
        }

        this.quiz = new Quiz(result.questions);
    } catch (error) {
        this.showError("Une erreur est survenue lors du chargement du quiz.");
        return;
    }

    // Initialisation du quiz
    this.renderInterface(this.sectionConfig, this.sectionQuiz);
    this.maxPageTxt.textContent = this.quiz.questions.length;
    this.sectionQuiz.classList.add('enter');
    this.quiz.loadQuestion();

    this.isTimerEnabled = this.timerChoice.value === "true";
    if (this.isTimerEnabled) this.startTimer();
    this.quiz.playSound("click");
}

animateContainer(direction = 'next', callback = null, forceExit = false) {
    if ((direction === 'prev' && this.quiz.currentQuestionIndex === 0) || this.isAnimating) {
        this.isAnimating = false;
        return;
    }

    this.isAnimating = true;

    const exitClass = direction === 'next' ? 'exit' : 'exit-reverse';
    const enterClass = direction === 'next' ? 'enter' : 'enter-reverse';

    this.sectionQuiz.classList.remove('enter', 'enter-reverse', 'exit', 'exit-reverse');
    void this.sectionQuiz.offsetWidth; // Force reflow

    // Animation de sortie
    this.sectionQuiz.classList.add(exitClass);
    this.questionTxt.classList.add('textExit');
    const answerButtons = document.querySelectorAll('#answers button');
    answerButtons.forEach(btn => btn.classList.add('textExit'));

    const handleExit = (ev) => {
        if (!ev.animationName.includes('questionExit')) return;
        this.sectionQuiz.removeEventListener('animationend', handleExit);

        this.sectionQuiz.classList.remove(exitClass);
        this.questionTxt.classList.remove('textExit');
        answerButtons.forEach(btn => btn.classList.remove('textExit'));

        // Si c’est la dernière question et qu’on force l’animation, on n’ajoute pas l’animation d’entrée
        const isLast = this.quiz.currentQuestionIndex === this.quiz.questions.length - 1;
        if (isLast && forceExit) {
            this.isAnimating = false;
            if (typeof callback === 'function') callback();
            return;
        }

        // Animation d'entrée normale
        void this.sectionQuiz.offsetWidth;
        this.sectionQuiz.classList.add(enterClass);
        this.questionTxt.classList.add('textEnter');
        answerButtons.forEach(btn => btn.classList.add('textEnter'));

        const handleEnter = (ev2) => {
            if (!ev2.animationName.includes('questionEnter')) return;
            this.sectionQuiz.removeEventListener('animationend', handleEnter);

            this.sectionQuiz.classList.remove(enterClass);
            this.questionTxt.classList.remove('textEnter');
            answerButtons.forEach(btn => btn.classList.remove('textEnter'));

            this.isAnimating = false;
            if (typeof callback === 'function') callback();
        };

        this.sectionQuiz.addEventListener('animationend', handleEnter);
    };

    this.sectionQuiz.addEventListener('animationend', handleExit);
}


async checkMinMaxQuestions(categoryId) {
    if (!this.difficulty || !this.nbrQue) {
        console.error("Aucune difficulté ou catégorie définie");
        return;
    }

    const difficulty = this.difficulty.value;
    let maxQuestions = this.maxCallQuestion;

    try {
        if (categoryId !== "any") {
            const result = await QuizService.fetchNbrQuestions(categoryId);

            if (result.status === "error") {
                this.showError(result.message);
                return;
            }

            const counts = result.category_question_count;

            switch (difficulty) {
                case "easy": maxQuestions = counts.total_easy_question_count; break;
                case "medium": maxQuestions = counts.total_medium_question_count; break;
                case "hard": maxQuestions = counts.total_hard_question_count; break;
                default: maxQuestions = counts.total_question_count; break;
            }
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de questions :", error);
    }

    const maxAllowed = Math.min(maxQuestions, this.maxCallQuestion);
    const minAllowed = 1;
    let currentValue = parseInt(this.nbrQue.value, 10);

	// Correction de la valeur si hors limites											  
    if (isNaN(currentValue) || currentValue < minAllowed) {
        currentValue = minAllowed;
    } else if (currentValue > maxAllowed) {
        currentValue = maxAllowed;
    }

    this.nbrQue.value = currentValue;
    this.nbrQue.setAttribute("min", minAllowed.toString());
    this.nbrQue.setAttribute("max", maxAllowed.toString());

    this.updateMaxPageScore(currentValue);
}

//Update max page et score							  
updateMaxPageScore(maxNbr) {
	// Mettre à jour le max-score								  
    this.maxScoreTxt.textContent = maxNbr;
    this.maxPageTxt.textContent = maxNbr;
}

//Reset		   
quizReset() {
	// Réinitialisation des données									 
    this.quiz = null;
    this.selectedAnswer = null;
    this.isChangingPage = false;
    this.config = null;

	// Réinitialisation du timer							 
    clearInterval(this.timerInterval);
    this.timeRemaining = this.duration;
    this.timerElement.textContent = "";

	// Réinitialisation de l’interface										 
    this.pageTxt.textContent = 1;
    this.scoreTxt.textContent = 0;
}

//Timer		   
startTimer() {
    this.timeRemaining = this.duration;

    this.timerInterval = setInterval(() => {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;

        this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timeRemaining--;

        if (this.timeRemaining < 0) {
            this.timeRemaining = 0;
            clearInterval(this.timerInterval);
            this.timerElement.textContent = "⏰ Temps écoulé !";
            this.endQuiz();
        }
    }, 1000);
}

    // Initialise l'application							   
async init() {
    await this.getCategories();

        // Vérifie si un thème est déjà enregistré													   
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        this.themeToggle.textContent = "☀️ Mode clair";
    }
}

    // Affichage
renderInterface(hide, show) {
    hide.classList.add("hidden");
    show.classList.remove("hidden");
}

openModal() {
    const quizHistory = this.quiz?.results || [];
    this.resultsTableBody.innerHTML = "";

    if (quizHistory.length === 0) {
		 // Reset des infos									  
        this.resultsTableBody.innerHTML = "<tr><td colspan='5'>Aucun résultat disponible</td></tr>";
        return;
    }

    quizHistory.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.question}</td>
        <td>${item.selectedAnswer}</td>
        <td>${item.correctAnswer}</td>
        <td>${item.isCorrect ? "✅" : "❌"}</td>
        `;
        this.resultsTableBody.appendChild(row);
    });
}

//Erreurs
/**
 * Affiche un message d'erreur
 * @param {string} message - Message d'erreur
 */
showError(message) {
    this.errorDiv.textContent = message;
    this.errorDiv.classList.add("visible");
    setTimeout(() => {
        this.clearError();
    }, 5000);
}

clearError() {
    this.errorDiv.classList.remove("visible");
}
}