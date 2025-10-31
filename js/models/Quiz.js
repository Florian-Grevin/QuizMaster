import { Questions } from '../models/Questions.js';

class Quiz {
    constructor(questions = []) {
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctIndex = 0;
        this.results = [];
        this.audioPath = "/assets/sounds/";

        // Références DOM ( à partager?)
        this.scoreTxt = document.getElementById("score");
        this.questionTxt = document.getElementById("question");
        this.answersContainer = document.querySelector('#answers');
        this.page = document.getElementById("page");
    }

    getScore() {
        return this.score;
    }

    playSound(se) {
        const audio = document.getElementById("click");
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.setAttribute("src", this.audioPath + se + ".mp3");
            audio.play().catch(error => {
                console.error("Erreur lors de la lecture du son :", error);
            });
        } else {
            console.log("Pas d'audio trouvé");
        }
    }

    restorePreviousAnswer() {
        const result = this.results.find(r => r.id === this.currentQuestionIndex);
        if (!result) return;

        const answerIndex = this.shuffledAnswers.findIndex(ans => ans === result.selectedAnswer);
        const buttons = document.querySelectorAll('#answers button');

        buttons.forEach((btn, index) => {
            btn.style.backgroundColor = "#ef4444"; // Rouge par défaut
            if (index === this.correctIndex) btn.style.backgroundColor = "#22c55e"; // Vert si correct
            if (index === answerIndex) btn.classList.add("selected");
            btn.disabled = true; // Désactivation ici
        });
    }

    isQuestionAnswered(index) {
        return this.results.some(r => r.id === index);
    }

    submitAnswer(answer) {
        if (!answer || typeof answer !== 'string') return; // Aucune réponse, on l'ignore
        if (this.isQuestionAnswered(this.currentQuestionIndex)) return; // Question déjà répondue, on l'ignore

        const answerIndex = parseInt(answer.split('-').pop());
        if (isNaN(answerIndex)) return;

        // Mise à jour visuelle des boutons
        document.querySelectorAll('#answers button').forEach(btn => {
            btn.style.backgroundColor = "#ef4444";
        });

        const currentQuestion = this.questions[this.currentQuestionIndex];
        const isCorrect = answerIndex === this.correctIndex;

        // Enregistrement du résultat
        const newResult = {
            id: this.currentQuestionIndex,
            question: currentQuestion.question,
            selectedAnswer: this.shuffledAnswers[answerIndex],
            correctAnswer: currentQuestion.correct_answer,
            isCorrect: isCorrect
        };

        const existingIndex = this.results.findIndex(r => r.id === this.currentQuestionIndex);
        if (existingIndex !== -1) {
            this.results[existingIndex] = newResult;
        } else {
            this.results.push(newResult);
        }

        if (isCorrect) {
            this.score++;
            this.scoreTxt.innerHTML = this.score;
            this.playSound("correct");
        } else {
            this.playSound("wrong");
        }

        document.getElementById("answer-" + this.correctIndex).style.backgroundColor = "#22c55e";
        return answer;
    }

    // Converti la chaîne de caractères en décodant les entités HTML
    decodeHtmlEntities(str) {
        const txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
    }

    toggleNavButtons() {
        const prevBtn = document.getElementById("prev");
        const nextBtn = document.getElementById("next");

        const atStart = this.currentQuestionIndex === 0;
        const atEnd = this.currentQuestionIndex === this.questions.length - 1 && this.isQuestionAnswered(this.currentQuestionIndex);

        prevBtn.disabled = atStart;
        prevBtn.classList.toggle("disabled", atStart);
        nextBtn.disabled = atEnd;
    }

    loadQuestion() {
        this.toggleNavButtons(); // Désactive visuellement le bouton previous

        const current = this.questions[this.currentQuestionIndex];
        const correctAnswer = current.correct_answer;
        const allAnswers = [...current.incorrect_answers, correctAnswer];

        Questions.shuffleArray(allAnswers);
        this.correctIndex = allAnswers.findIndex(ans => ans === correctAnswer);
        this.shuffledAnswers = allAnswers;

        this.questionTxt.innerHTML = this.decodeHtmlEntities(current.question);
        this.answersContainer.innerHTML = '';

        // Génération des boutons
        allAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.id = `answer-${index}`;
            button.textContent = this.decodeHtmlEntities(answer);
            button.style.backgroundColor = ""; // Reset couleur
            this.answersContainer.appendChild(button);
        });

        document.querySelectorAll('#answers button').forEach(btn => btn.classList.remove('selected')); // Reset du select
        this.restorePreviousAnswer(); // Gère aussi la désactivation si nécessaire

        this.page.innerHTML = this.currentQuestionIndex + 1;
    }

    isComplete() {
        return this.results.length === this.questions.length &&
            this.results.every(r => r.selectedAnswer !== null && r.selectedAnswer !== undefined);
    }

    // Récuperer les questions non répondu
    getUnansweredQuestions() {
        return this.questions
            .map((q, index) => index)
            .filter(index => !this.isQuestionAnswered(index));
    }

    changePage(direction) {
        // Vérifier si toutes les questions sont répondues
        switch (direction) {
            case 'next':
                if (this.currentQuestionIndex < this.questions.length - 1) {
                    this.currentQuestionIndex++;
                } else {
                    return "end"; // signaler la fin du quiz
                }
                break;
            case 'prev':
                if (this.currentQuestionIndex > 0) {
                    this.currentQuestionIndex--;
                }
                break;
        }

        this.loadQuestion();
        return "continue"; // signaler que le quiz continue
    }

    saveQuizResult() {
        const now = new Date();
        const timestamp = now.toISOString();

        const totalQuestions = this.results.length;
        const correctAnswers = this.results.filter(r => r.isCorrect).length;
        const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);

        const newEntry = {
            date: timestamp,
            scorePercent: scorePercent,
            history: this.results
        };

        // Récupérer les anciens résultats
        const existingData = JSON.parse(localStorage.getItem("quizMaster")) || [];

        // Ajouter le nouveau résultat
        existingData.push(newEntry);

        // Sauvegarder le tableau mis à jour
        localStorage.setItem("quizMaster", JSON.stringify(existingData));

        console.log(`Résultat ajouté à quizMaster (${existingData.length} entrées)`);
    }
}

export { Quiz };