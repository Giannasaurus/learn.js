class QuizManager {
    constructor() {
        this.currentMode = 'classic';
        this.currentModule = 'syntax';
        this.questionCount = 10;
        this.currentQuestion = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 120;
        this.startTime = null;
        this.questions = [];
        this.answers = [];

        this.loadQuestions().then(() => {
            this.initializeEventListeners();
        });
    }

    async loadQuestions() {
        try {
            const response = await fetch('../../data/quizzes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.questionBank = await response.json();
        } catch (error) {
            console.error('Failed to load questions:', error);
            document.getElementById('quiz-setup').innerHTML = `
                <div class="error-message">
                    <h3>Failed to load questions</h3>
                    <p>Please check that quizzes.json exists and is valid JSON.</p>
                    <p>Error: ${error.message}</p>
                </div>`;
        }
    }

    initializeEventListeners() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
        });

        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setModule(btn.dataset.module));
        });

        document.getElementById('items-select').addEventListener('change', (e) => {
            this.questionCount = parseInt(e.target.value);
        });

        document.getElementById('start-quiz').addEventListener('click', () => {
            console.log('Start button clicked');
            this.startQuiz();
        });

        document.getElementById('prev-question').addEventListener('click',
            () => this.navigateQuestion(-1));
        document.getElementById('next-question').addEventListener('click',
            () => this.navigateQuestion(1));

        document.getElementById('retry-quiz').addEventListener('click', () => {
            this.resetQuiz();
        });
    }

    setMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        this.currentMode = mode;
    }

    setModule(module) {
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-module="${module}"]`).classList.add('active');
        this.currentModule = module;
    }

    startQuiz() {
        this.score = 0;
        this.currentQuestion = 0;
        this.startTime = Date.now();
        this.answers = new Array(this.questionCount).fill(null);

        const moduleQuestions = [...this.questionBank[this.currentModule]];
        this.questions = this.shuffleArray(moduleQuestions)
            .slice(0, this.questionCount);

        this.showScreen('quiz-questions');
        this.updateNavigationButtons();
        this.generateQuestionDots();

        const timerElement = document.getElementById('timer');
        if (this.currentMode === 'survival') {
            this.startTimer();
            timerElement.classList.remove('hidden');
        } else {
            timerElement.classList.add('hidden');
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }

        this.loadQuestion();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    navigateQuestion(direction) {
        this.currentQuestion += direction;
        this.updateNavigationButtons();
        this.loadQuestion();
    }

    updateNavigationButtons() {
        document.getElementById('prev-question').disabled =
            this.currentQuestion === 0;
        document.getElementById('next-question').disabled =
            this.currentQuestion === this.questionCount - 1;

        document.querySelectorAll('.question-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentQuestion);
            dot.classList.toggle('answered', this.answers[index] !== null);
        });
    }

    generateQuestionDots() {
        const dotsContainer = document.querySelector('.question-dots');
        dotsContainer.innerHTML = '';

        for (let i = 0; i < this.questionCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'question-dot';
            dot.addEventListener('click', () => {
                this.currentQuestion = i;
                this.updateNavigationButtons();
                this.loadQuestion();
            });
            dotsContainer.appendChild(dot);
        }
    }

    startTimer() {
        this.timeLeft = 120;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.endQuiz();
            } else if (this.timeLeft <= 30) {
                document.getElementById('timer').classList.add('warning');
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer').textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    loadQuestion() {
        const question = this.questions[this.currentQuestion];
        if (!question) return;

        document.getElementById('question-text').textContent = question.text;
        document.getElementById('current-question').textContent = this.currentQuestion + 1;
        document.getElementById('total-questions').textContent = this.questionCount;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        const previousAnswer = this.answers[this.currentQuestion];

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;

            if (previousAnswer !== null) {
                button.disabled = true;
                if (index === previousAnswer) {
                    button.classList.add(previousAnswer === question.correct ? 'correct' : 'wrong');
                }
                if (index === question.correct) {
                    button.classList.add('correct');
                }
            }

            button.addEventListener('click', () => this.selectOption(index, question.correct));
            optionsContainer.appendChild(button);
        });
    }

    selectOption(selectedIndex, correctIndex) {
        const options = document.querySelectorAll('.option-btn');
        options.forEach(option => option.disabled = true);

        options[selectedIndex].classList.add(
            selectedIndex === correctIndex ? 'correct' : 'wrong'
        );
        options[correctIndex].classList.add('correct');

        if (selectedIndex === correctIndex) this.score++;
        this.answers[this.currentQuestion] = selectedIndex;

        setTimeout(() => {
            if (this.currentQuestion < this.questionCount - 1) {
                this.navigateQuestion(1);
            } else {
                this.endQuiz();
            }
        }, 1500);
    }

    endQuiz() {
        if (this.timer) clearInterval(this.timer);

        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeTaken / 60);
        const seconds = timeTaken % 60;

        document.getElementById('correct-answers').textContent = this.score;
        document.getElementById('total-answers').textContent = this.questionCount;
        document.getElementById('score-percentage').textContent =
            Math.round((this.score / this.questionCount) * 100) + '%';
        document.getElementById('time-taken').textContent =
            `Time: ${minutes}m ${seconds}s`;

        this.showScreen('quiz-results');
    }

    resetQuiz() {
        this.showScreen('quiz-setup');
    }

    showScreen(screenId) {
        document.querySelectorAll('.quiz-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizManager();
});
