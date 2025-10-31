/**
 * Modèle Questions pour structurer les données
 */
export class Questions {
    constructor(data) {
        this.type = data.type;
        this.difficulty = data.difficulty;
        this.category = data.category;
        this.question = data.question;
        this.correct_answer = data.correct_answer;
        this.incorrect_answers = data.incorrect_answers;
    }

    /**
     * Randomization d'un tableau
     * @param {array} array - Tableau
     */
    static shuffleArray(array) {
        
        for (let i = array.length - 1; i > 0; i--) {
        // Génération d'un index random entre 0 et i
        let j = Math.floor(Math.random() * (i + 1));

        // Interveri les élements aux indices i and j
        [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

