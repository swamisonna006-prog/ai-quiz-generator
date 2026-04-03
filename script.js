document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Setup
    const setupSection = document.getElementById('setup-section');
    const quizSection = document.getElementById('quiz-section');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const dropZone = document.getElementById('drop-zone');
    const fileUpload = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');
    const generateBtn = document.getElementById('generate-btn');
    const sourceText = document.getElementById('source-text');
    const difficultySelect = document.getElementById('difficulty-select');
    const questionCountInput = document.getElementById('question-count');
    const topicFocusInput = document.getElementById('topic-focus');
    const learningReportContainer = document.getElementById('learning-report-container');
    const analysisLoading = document.getElementById('analysis-loading');
    const analysisContent = document.getElementById('analysis-content');
    const spinner = document.getElementById('loading-spinner');

    // DOM Elements - Quiz
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionCounter = document.getElementById('question-counter');
    const progressBar = document.getElementById('progress-bar');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const restartBtn = document.getElementById('restart-btn');
    const resultsContainer = document.getElementById('results-container');
    const scoreDisplay = document.getElementById('score-display');
    const playAgainBtn = document.getElementById('play-again-btn');

    // Mock Questions Database
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];

    // Setup Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // File Upload Handling
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles(files);
    });

    fileUpload.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            fileNameDisplay.textContent = `Attached: ${files[0].name}`;
        }
    }

    // Generate Quiz
    generateBtn.addEventListener('click', async () => {
        // Hardcoded API key
        const apiKey = 'AIzaSyBrhDGaweISggOAp93Tv77R5mPlz887BtI';

        // Simple validation
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        let textContent = '';
        if (activeTab === 'text') {
            textContent = sourceText.value.trim();
            if (!textContent) {
                alert('Please paste some text first.');
                return;
            }
        } else if (activeTab === 'upload') {
            const files = fileUpload.files;
            if (!files || files.length === 0) {
                alert('Please upload a document first.');
                return;
            }
            try {
                textContent = await extractTextFromFile(files[0]);
            } catch (err) {
                alert('Could not read the file. Note: only text files are currently supported.');
                return;
            }
        }

        // Show loading state
        generateBtn.style.display = 'none';
        spinner.classList.remove('hidden');

        const difficulty = difficultySelect.value;
        const numQuestions = questionCountInput.value || 5;
        const topicFocus = topicFocusInput.value.trim() || 'all topics';

        try {
            questions = await generateQuizFromAPI(textContent, apiKey, difficulty, numQuestions, topicFocus);
            userAnswers = new Array(questions.length).fill(null);
            currentQuestionIndex = 0;

            // Transition UI
            setupSection.classList.remove('active');
            setupSection.classList.add('hidden');
            setTimeout(() => {
                quizSection.classList.remove('hidden');
                quizSection.classList.add('active');
                initQuizView();
            }, 500); // Wait for fade out
        } catch (error) {
            alert(error.message);
        } finally {
            // Reset spinner
            generateBtn.style.display = 'flex';
            spinner.classList.add('hidden');
        }
    });

    function extractTextFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    async function generateQuizFromAPI(text, apiKey, difficulty, numQuestions, topicFocus) {
        const prompt = `Generate a ${numQuestions}-question multiple choice educational quiz for a student based on the following text. 
Make the language encouraging, clear, and student-friendly.
The difficulty should be ${difficulty}. The topic focus should be ${topicFocus}.
Return ONLY a valid JSON array. Each element should be an object with "question" (string), "concept" (2-4 words summarizing the topic), "explanation" (a helpful 1-2 sentence explanation of why the correct answer is right and correcting common student misconceptions), and "options" (array of objects). 
Each option object must have "text" (string) and "isCorrect" (boolean).
Example format:
[
  {
    "question": "What is 2+2?",
    "concept": "Basic Addition",
    "explanation": "If you have 2 apples and get 2 more, you have 4 apples in total! 3, 5, and 6 are incorrect.",
    "options": [
      { "text": "3", "isCorrect": false },
      { "text": "4", "isCorrect": true },
      { "text": "5", "isCorrect": false },
      { "text": "6", "isCorrect": false }
    ]
  }
]
Text to base the quiz on:
${text}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            let errorMsg = 'Failed to generate quiz. Please check your API key and try again.';
            try {
                const errData = await response.json();
                errorMsg = errData.error?.message || response.statusText;
            } catch (e) {}
            throw new Error(`API Error: ${errorMsg}`);
        }

        const data = await response.json();
        let jsonText = data.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonText);
    }

    function initQuizView() {
        // Hide results if showing
        resultsContainer.classList.add('hidden');
        document.querySelector('.question-container').style.display = 'block';
        document.querySelector('.quiz-footer').style.display = 'flex';

        loadQuestion(currentQuestionIndex);
    }

    function loadQuestion(index) {
        const q = questions[index];
        questionText.textContent = q.question;

        // Update Progress
        questionCounter.textContent = `Question ${index + 1} of ${questions.length}`;
        progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;

        // Render Options using map
        optionsContainer.innerHTML = q.options.map((opt, i) => {
            const isAttempted = userAnswers[index] !== null;
            const isSelected = userAnswers[index] === i;
            let statusClass = '';

            if (isAttempted) {
                if (opt.isCorrect) statusClass = 'correct';
                else if (isSelected && !opt.isCorrect) statusClass = 'wrong';
            }

            return `
                <div class="option-card ${isSelected && !isAttempted ? 'selected' : ''} ${statusClass}" data-index="${i}">
                    <div class="option-indicator"></div>
                    <div class="option-text">${opt.text}</div>
                </div>
            `;
        }).join('');

        // If attempted, reveal the tutor explanation immediately within the quiz pane
        const isAttempted = userAnswers[index] !== null;
        if (isAttempted) {
            const answeredIndex = userAnswers[index];
            const isCorrect = q.options[answeredIndex].isCorrect;
            
            const explanationDiv = document.createElement('div');
            explanationDiv.className = `explanation-box ${isCorrect ? 'correct-exp' : 'wrong-exp'}`;
            explanationDiv.innerHTML = `
                <h4>${isCorrect ? 'Excellent! 🎉' : 'Not quite! 💡'}</h4>
                <p>${q.explanation || 'Keep practicing to master this concept.'}</p>
            `;
            optionsContainer.appendChild(explanationDiv);
        }

        // Attach event listeners to newly created elements
        const optionElements = optionsContainer.querySelectorAll('.option-card');
        optionElements.forEach(optDiv => {
            optDiv.addEventListener('click', (e) => {
                const i = parseInt(e.currentTarget.getAttribute('data-index'));
                selectOption(i);
            });
        });

        // Update Buttons
        prevBtn.disabled = index === 0;
        if (index === questions.length - 1) {
            nextBtn.innerHTML = 'Submit Quiz <span class="material-symbols-rounded">done_all</span>';
        } else {
            nextBtn.innerHTML = 'Next <span class="material-symbols-rounded">arrow_forward</span>';
        }
    }

    function selectOption(optIndex) {
        // If already answered, don't allow changing
        if (userAnswers[currentQuestionIndex] !== null) return;

        userAnswers[currentQuestionIndex] = optIndex;

        // Remap to show correct/wrong immediately
        loadQuestion(currentQuestionIndex);
    }

    nextBtn.addEventListener('click', () => {
        if (userAnswers[currentQuestionIndex] === null) {
            alert("Please select an answer.");
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        } else {
            showResults();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion(currentQuestionIndex);
        }
    });

    restartBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to restart? All progress will be lost.")) {
            userAnswers.fill(null);
            currentQuestionIndex = 0;
            loadQuestion(0);
        }
    });

    async function showResults() {
        let score = 0;
        const failedQuestions = [];
        const successfulQuestions = [];

        userAnswers.forEach((ans, i) => {
            if(ans !== null && questions[i].options[ans].isCorrect) {
                score++;
                successfulQuestions.push(questions[i]);
            } else {
                failedQuestions.push(questions[i]);
            }
        });

        document.querySelector('.question-container').style.display = 'none';
        document.querySelector('.quiz-footer').style.display = 'none';
        
        resultsContainer.classList.remove('hidden');
        scoreDisplay.textContent = `${score}/${questions.length}`;

        // Reset learning report container
        learningReportContainer.classList.add('hidden');
        analysisContent.innerHTML = '';
        
        // Report generates even if 100% so we can show praises
        learningReportContainer.classList.remove('hidden');
        analysisLoading.classList.remove('hidden');
        
        try {
            // Hardcoded API key
            const apiKey = 'AIzaSyBrhDGaweISggOAp93Tv77R5mPlz887BtI';
            const reportHtml = await generateLearningReport(failedQuestions, successfulQuestions, apiKey);
            analysisContent.innerHTML = reportHtml;
        } catch (err) {
            analysisContent.innerHTML = `<p style="color: var(--danger)">Failed to load learning report. ${err.message}</p>`;
        } finally {
            analysisLoading.classList.add('hidden');
        }
    }

    async function generateLearningReport(failedQuestions, successfulQuestions, apiKey) {
        const failedStr = failedQuestions.map(q => q.concept || "Unknown Concept").join(', ');
        const successStr = successfulQuestions.map(q => q.concept || "Unknown Concept").join(', ');
        
        let wrongAnswersHtmlStructure = "";
        if (failedQuestions.length > 0) {
            wrongAnswersHtmlStructure = `
<h4 style="color:#a5b4fc;margin-top:20px;margin-bottom:10px;">Review of Incorrect Answers</h4>
` + failedQuestions.map((q) => `<div class="tutor-card">
   <h4>Q: ${q.question}</h4>
   <p>[Briefly explain why they got this wrong and what the correct answer is based on the question context, no more than 2 sentences]</p>
</div>`).join('\n');
        }

        const prompt = `The user took a quiz.
Concepts they succeeded at: ${successStr || 'None'}.
Concepts they failed: ${failedStr || 'None'}.

Return ONLY valid HTML. DO NOT add markdown formatting like \`\`\`html. Use EXACTLY this template:
<div class="report-section">
   <div class="good-box">
      <h4 style="color:var(--success);">What You Did Well</h4>
      <p>[1-2 sentences summarizing their strengths based on good concepts]</p>
   </div>
   <div class="bad-box">
      <h4 style="color:var(--danger);">Areas for Improvement</h4>
      <p>[1-2 sentences summarizing where they fell short, if none write "Perfect score! Keep it up!"]</p>
   </div>
</div>
${wrongAnswersHtmlStructure}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        if (!response.ok) {
            throw new Error('Analysis generation failed.');
        }

        const data = await response.json();
        let htmlText = data.candidates[0].content.parts[0].text;
        htmlText = htmlText.replace(/```html/g, '').replace(/```/g, '').trim();
        return htmlText;
    }

    playAgainBtn.addEventListener('click', () => {
        // Go back to setup
        quizSection.classList.remove('active');
        quizSection.classList.add('hidden');
        setTimeout(() => {
            setupSection.classList.remove('hidden');
            setupSection.classList.add('active');
        }, 500);
    });
});
