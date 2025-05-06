"use strict";
const ALL_NOTES = [{ latin: 'Do', english: 'C' }, { latin: 'Do#', english: 'C#' }, { latin: 'Re', english: 'D' }, { latin: 'Re#', english: 'D#' }, { latin: 'Mi', english: 'E' }, { latin: 'Fa', english: 'F' }, { latin: 'Fa#', english: 'F#' }, { latin: 'Sol', english: 'G' }, { latin: 'Sol#', english: 'G#' }, { latin: 'La', english: 'A' }, { latin: 'La#', english: 'A#' }, { latin: 'Si', english: 'B' }];
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const SCALE_DEGREES = [{ degree: 1, nameLatin: 'Primera', nameEnglish: 'First', quality: 'M' }, { degree: 2, nameLatin: 'Segunda', nameEnglish: 'Second', quality: 'm' }, { degree: 3, nameLatin: 'Tercera', nameEnglish: 'Third', quality: 'm' }, { degree: 4, nameLatin: 'Cuarta', nameEnglish: 'Fourth', quality: 'M' }, { degree: 5, nameLatin: 'Quinta', nameEnglish: 'Fifth', quality: 'M' }, { degree: 6, nameLatin: 'Sexta', nameEnglish: 'Sixth', quality: 'm' }, { degree: 7, nameLatin: 'Séptima', nameEnglish: 'Seventh', quality: 'dim' },];
// --- Estado ---
let currentNotation = 'latin';
let currentQuizMode = null;
let selectedRootNote = null;
let currentQuestionData = null;
let currentDegreeIndex = null;
// --- Referencias DOM ---
let notationLatinRadio;
let notationEnglishRadio;
let learnEnglishBtn;
let learnEnglishSection;
let closeLearnEnglishBtn;
let modeSelectionDiv;
let modeCompleteBtn;
let modeSpecificBtn;
let keySelectionDiv;
let keyButtonsDiv;
let quizAreaDiv;
let questionTextElement;
let completeAnswerArea;
let submitCompleteAnswerBtn;
let retryCompleteBtn;
let gobackCompleteBtn;
let specificAnswerArea;
let feedbackArea;
let feedbackMessage;
let nextQuestionBtn;
let gobackSpecificBtn;
let changeModeBtn;
let correctSound;
let incorrectSound;
let appContainer;
// --- Funciones Auxiliares ---
function getNoteInfo(noteName) { return ALL_NOTES.find(n => n.latin === noteName || n.english === noteName); }
function getNoteByIndex(index) { return ALL_NOTES[index % 12]; }
function findNoteIndex(noteInfo) { return ALL_NOTES.findIndex(n => n.english === noteInfo.english); }
function calculateMajorScale(rootNote) { const rootIndex = findNoteIndex(rootNote); if (rootIndex === -1)
    return []; return MAJOR_SCALE_INTERVALS.map(interval => getNoteByIndex(rootIndex + interval)); }
function formatNoteName(noteInfo, notation) { return notation === 'latin' ? noteInfo.latin : noteInfo.english; }
function formatAnswerForSpecificMode(noteInfo, quality, notation) { const noteName = formatNoteName(noteInfo, notation); const suffix = quality; return `${noteName}${suffix}`; }
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
} return array; }
// --- Generación de Preguntas ---
function generateCompleteQuestion(rootNote, notation) { const scale = calculateMajorScale(rootNote); const rootNoteName = formatNoteName(rootNote, notation); currentQuestionData = { questionText: `Escribe la escala mayor de ${rootNoteName}:`, correctAnswer: scale.map(note => formatNoteName(note, notation)), }; displayQuestion(); }
function generateSpecificQuestion(rootNote, notation) { const scale = calculateMajorScale(rootNote); if (scale.length !== 7)
    return; const validDegreeIndices = [0, 1, 2, 3, 4, 5]; currentDegreeIndex = validDegreeIndices[Math.floor(Math.random() * validDegreeIndices.length)]; const targetDegreeInfo = SCALE_DEGREES[currentDegreeIndex]; const targetQuality = targetDegreeInfo.quality; const correctNoteInfo = scale[currentDegreeIndex]; const correctAnswer = formatAnswerForSpecificMode(correctNoteInfo, targetQuality, notation); const degreeName = notation === 'latin' ? targetDegreeInfo.nameLatin : targetDegreeInfo.nameEnglish; const rootNoteName = formatNoteName(rootNote, notation); const incorrectOptions = []; const allPossibleNotesFormatted = []; ALL_NOTES.forEach(note => { ['M', 'm'].forEach(q => { allPossibleNotesFormatted.push(formatAnswerForSpecificMode(note, q, notation)); }); }); const filteredOptions = allPossibleNotesFormatted.filter(opt => opt !== correctAnswer); shuffleArray(filteredOptions); while (incorrectOptions.length < 5 && filteredOptions.length > 0) {
    const option = filteredOptions.pop();
    if (option && !incorrectOptions.includes(option)) {
        incorrectOptions.push(option);
    }
} while (incorrectOptions.length < 5) {
    const randomNote = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
    const randomQuality = Math.random() > 0.5 ? 'M' : 'm';
    const fallbackOption = formatAnswerForSpecificMode(randomNote, randomQuality, notation);
    if (fallbackOption !== correctAnswer && !incorrectOptions.includes(fallbackOption)) {
        incorrectOptions.push(fallbackOption);
    }
} const allOptions = shuffleArray([correctAnswer, ...incorrectOptions]); currentQuestionData = { questionText: `¿Cuál es la ${degreeName.toLowerCase()} nota de la escala de ${rootNoteName} Mayor?`, correctAnswer: correctAnswer, options: allOptions }; displayQuestion(); }
// --- UI ---
function updateUI() { keyButtonsDiv.innerHTML = ''; ALL_NOTES.filter((_, i) => [0, 2, 4, 5, 7, 9, 11].includes(i)).forEach(noteInfo => { const button = document.createElement('button'); button.textContent = formatNoteName(noteInfo, currentNotation); button.className = 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out transform hover:scale-110 focus:ring-offset-slate-800'; button.dataset.noteLatin = noteInfo.latin; button.dataset.noteEnglish = noteInfo.english; button.addEventListener('click', handleKeySelection); keyButtonsDiv.appendChild(button); }); modeSelectionDiv.classList.toggle('hidden', currentQuizMode !== null); keySelectionDiv.classList.toggle('hidden', currentQuizMode === null || selectedRootNote !== null); quizAreaDiv.classList.toggle('hidden', selectedRootNote === null); learnEnglishSection.classList.add('hidden'); if (currentQuizMode === 'complete') {
    completeAnswerArea.classList.remove('hidden');
    specificAnswerArea.classList.add('hidden');
}
else if (currentQuizMode === 'specific') {
    completeAnswerArea.classList.add('hidden');
    specificAnswerArea.classList.remove('hidden');
}
else {
    completeAnswerArea.classList.add('hidden');
    specificAnswerArea.classList.add('hidden');
} changeModeBtn.classList.toggle('hidden', selectedRootNote === null); clearFeedback(); }
function handleCompleteInputKeypress(event) { if (event.key === 'Enter') {
    event.preventDefault();
    if (!submitCompleteAnswerBtn.disabled) {
        handleCompleteAnswer();
    }
} }
function displayQuestion() {
    var _a;
    if (!currentQuestionData || !quizAreaDiv || !questionTextElement)
        return;
    quizAreaDiv.classList.remove('hidden');
    questionTextElement.textContent = currentQuestionData.questionText;
    clearFeedback();
    nextQuestionBtn.classList.add('hidden');
    gobackSpecificBtn.classList.add('hidden');
    retryCompleteBtn.classList.add('hidden');
    gobackCompleteBtn.classList.add('hidden');
    if (currentQuizMode === 'complete') {
        completeAnswerArea.classList.remove('hidden');
        specificAnswerArea.classList.add('hidden');
        const inputs = completeAnswerArea.querySelectorAll('.scale-note-input');
        inputs.forEach(input => {
            input.value = '';
            input.disabled = false;
            input.removeEventListener('keypress', handleCompleteInputKeypress);
            input.addEventListener('keypress', handleCompleteInputKeypress);
        });
        (_a = inputs[0]) === null || _a === void 0 ? void 0 : _a.focus();
        submitCompleteAnswerBtn.classList.remove('hidden');
        submitCompleteAnswerBtn.disabled = false;
    }
    else if (currentQuizMode === 'specific' && currentQuestionData.options) {
        completeAnswerArea.classList.add('hidden');
        specificAnswerArea.classList.remove('hidden');
        specificAnswerArea.innerHTML = '';
        const buttonColorClasses = ['bg-red-600 hover:bg-red-500', 'bg-blue-600 hover:bg-blue-500', 'bg-green-600 hover:bg-green-500', 'bg-yellow-500 hover:bg-yellow-400', 'bg-purple-600 hover:bg-purple-500', 'bg-pink-600 hover:bg-pink-500',];
        currentQuestionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            const colorClass = buttonColorClasses[index % buttonColorClasses.length];
            button.className = `font-semibold py-2 px-4 rounded shadow-md transition duration-150 ease-in-out transform hover:scale-105 ${colorClass}`;
            if (colorClass.includes('yellow')) {
                button.classList.add('text-yellow-950');
            }
            else {
                button.classList.add('text-white');
            }
            button.dataset.answer = option;
            button.addEventListener('click', handleSpecificAnswer);
            specificAnswerArea.appendChild(button);
        });
    }
}
function showFeedback(isCorrect) {
    if (!feedbackMessage || !correctSound || !incorrectSound || !appContainer)
        return;
    const baseFeedbackClasses = "text-lg font-medium text-gray-200 px-4 py-2 rounded-md w-full max-w-md border"; // Clases base del HTML
    let messageContent = isCorrect ? "¡Correcto! 🎉" : "Incorrecto. ¡Sigue intentando! 🤔";
    // Añadir la respuesta correcta si es incorrecto y en modo específico
    if (!isCorrect && currentQuizMode === 'specific' && currentQuestionData) {
        messageContent += ` La respuesta era: ${currentQuestionData.correctAnswer}`;
    }
    feedbackMessage.textContent = messageContent;
    feedbackMessage.className = `${baseFeedbackClasses} ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
    // Aplicar animaciones al contenedor principal
    appContainer.classList.remove('correct-animation', 'shake-animation');
    void appContainer.offsetWidth; // Forzar reflow para reiniciar animación
    if (isCorrect) {
        correctSound.play().catch(e => console.error("Error playing sound:", e));
        appContainer.classList.add('correct-animation');
    }
    else {
        incorrectSound.play().catch(e => console.error("Error playing sound:", e));
        appContainer.classList.add('shake-animation');
    }
    // Lógica de botones post-respuesta
    if (currentQuizMode === 'complete') {
        submitCompleteAnswerBtn.classList.add('hidden');
        submitCompleteAnswerBtn.disabled = true;
        gobackCompleteBtn.classList.remove('hidden');
        const inputs = completeAnswerArea.querySelectorAll('.scale-note-input');
        inputs.forEach(input => input.disabled = true);
        if (!isCorrect) {
            retryCompleteBtn.classList.remove('hidden');
            retryCompleteBtn.focus();
        }
        else {
            retryCompleteBtn.classList.add('hidden');
            gobackCompleteBtn.focus();
        }
    }
    else if (currentQuizMode === 'specific') {
        const buttons = specificAnswerArea.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
        nextQuestionBtn.classList.remove('hidden');
        nextQuestionBtn.disabled = false;
        gobackSpecificBtn.classList.remove('hidden');
        nextQuestionBtn.focus();
    }
    // Limpiar animación después de que termine
    setTimeout(() => {
        appContainer.classList.remove('correct-animation', 'shake-animation');
    }, 800); // Duración de la animación más larga
}
function clearFeedback() {
    if (!feedbackMessage)
        return;
    const baseFeedbackClasses = "text-lg font-medium px-4 py-2 rounded-md w-full max-w-md border";
    feedbackMessage.textContent = '';
    feedbackMessage.className = `${baseFeedbackClasses} text-gray-400 border-transparent`; // Texto gris claro y borde transparente
}
// --- Handlers ---
function handleNotationChange(event) { currentNotation = event.target.value; updateUI(); if (selectedRootNote && currentQuizMode) {
    generateNewQuestion();
} }
function handleLearnEnglishToggle() { learnEnglishSection.classList.toggle('hidden'); }
function handleModeSelection(event) { currentQuizMode = event.target.dataset.mode; selectedRootNote = null; updateUI(); }
function handleKeySelection(event) { const target = event.target; const noteLatin = target.dataset.noteLatin; const noteEnglish = target.dataset.noteEnglish; if (noteLatin && noteEnglish) {
    selectedRootNote = { latin: noteLatin, english: noteEnglish };
    keySelectionDiv.classList.add('hidden');
    generateNewQuestion();
} }
function generateNewQuestion() { if (selectedRootNote && currentQuizMode) {
    clearFeedback();
    if (currentQuizMode === 'complete') {
        generateCompleteQuestion(selectedRootNote, currentNotation);
    }
    else if (currentQuizMode === 'specific') {
        generateSpecificQuestion(selectedRootNote, currentNotation);
    }
} }
function handleCompleteAnswer() { if (!currentQuestionData || !Array.isArray(currentQuestionData.correctAnswer))
    return; const inputs = completeAnswerArea.querySelectorAll('.scale-note-input'); const userAnswers = Array.from(inputs).map(input => input.value.trim()); const correctAnswers = currentQuestionData.correctAnswer; let isCorrect = userAnswers.length === correctAnswers.length && userAnswers.every((answer, index) => answer.toLowerCase() === correctAnswers[index].toLowerCase()); showFeedback(isCorrect); }
function handleSpecificAnswer(event) {
    if (!currentQuestionData || typeof currentQuestionData.correctAnswer !== 'string')
        return;
    const target = event.target;
    const userAnswer = target.dataset.answer;
    const correctAnswer = currentQuestionData.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;
    const buttons = specificAnswerArea.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('ring-2', 'ring-offset-2', 'ring-red-500', 'ring-green-500', 'ring-blue-400', 'ring-offset-slate-700', 'ring-offset-1');
        if (btn.dataset.answer === userAnswer) {
            const ringColorClasses = isCorrect ? ['ring-green-500'] : ['ring-red-500'];
            btn.classList.add('ring-2', 'ring-offset-2', 'ring-offset-slate-700', ...ringColorClasses);
        }
        if (!isCorrect && btn.dataset.answer === correctAnswer) {
            btn.classList.add('ring-2', 'ring-offset-1', 'ring-offset-slate-700', 'ring-blue-400');
        }
    });
    showFeedback(isCorrect);
}
function handleRetryComplete() { var _a; if (currentQuizMode !== 'complete')
    return; clearFeedback(); const inputs = completeAnswerArea.querySelectorAll('.scale-note-input'); inputs.forEach(input => { input.disabled = false; input.value = ''; }); submitCompleteAnswerBtn.classList.remove('hidden'); submitCompleteAnswerBtn.disabled = false; retryCompleteBtn.classList.add('hidden'); gobackCompleteBtn.classList.add('hidden'); (_a = inputs[0]) === null || _a === void 0 ? void 0 : _a.focus(); }
function handleChangeMode() {
    currentQuizMode = null;
    selectedRootNote = null;
    currentQuestionData = null;
    quizAreaDiv.classList.add('hidden');
    nextQuestionBtn.classList.add('hidden');
    gobackSpecificBtn.classList.add('hidden');
    retryCompleteBtn.classList.add('hidden');
    gobackCompleteBtn.classList.add('hidden');
    updateUI();
}
// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    notationLatinRadio = document.getElementById('notation-latin');
    notationEnglishRadio = document.getElementById('notation-english');
    learnEnglishBtn = document.getElementById('learn-english-btn');
    learnEnglishSection = document.getElementById('learn-english-section');
    closeLearnEnglishBtn = document.getElementById('close-learn-english-btn');
    modeSelectionDiv = document.getElementById('mode-selection');
    modeCompleteBtn = document.getElementById('mode-complete');
    modeSpecificBtn = document.getElementById('mode-specific');
    keySelectionDiv = document.getElementById('key-selection');
    keyButtonsDiv = document.getElementById('key-buttons');
    quizAreaDiv = document.getElementById('quiz-area');
    questionTextElement = document.getElementById('question-text');
    completeAnswerArea = document.getElementById('complete-answer-area');
    submitCompleteAnswerBtn = document.getElementById('submit-complete-answer');
    retryCompleteBtn = document.getElementById('retry-complete-btn');
    gobackCompleteBtn = document.getElementById('goback-complete-btn');
    specificAnswerArea = document.getElementById('specific-answer-area');
    feedbackArea = document.getElementById('feedback-area');
    feedbackMessage = document.getElementById('feedback-message');
    nextQuestionBtn = document.getElementById('next-question-btn');
    gobackSpecificBtn = document.getElementById('goback-specific-btn');
    changeModeBtn = document.getElementById('change-mode-btn');
    correctSound = document.getElementById('correct-sound');
    incorrectSound = document.getElementById('incorrect-sound');
    appContainer = document.getElementById('app-container');
    const elements = [notationLatinRadio, notationEnglishRadio, learnEnglishBtn, learnEnglishSection, closeLearnEnglishBtn, modeSelectionDiv, modeCompleteBtn, modeSpecificBtn, keySelectionDiv, keyButtonsDiv, quizAreaDiv, questionTextElement, completeAnswerArea, submitCompleteAnswerBtn, retryCompleteBtn, gobackCompleteBtn, specificAnswerArea, feedbackArea, feedbackMessage, nextQuestionBtn, gobackSpecificBtn, changeModeBtn, correctSound, incorrectSound, appContainer];
    if (elements.some(el => !el)) {
        console.error("Error: No se pudieron encontrar todos los elementos del DOM necesarios.");
        return;
    }
    notationLatinRadio.addEventListener('change', handleNotationChange);
    notationEnglishRadio.addEventListener('change', handleNotationChange);
    learnEnglishBtn.addEventListener('click', handleLearnEnglishToggle);
    closeLearnEnglishBtn.addEventListener('click', handleLearnEnglishToggle);
    modeCompleteBtn.addEventListener('click', handleModeSelection);
    modeSpecificBtn.addEventListener('click', handleModeSelection);
    submitCompleteAnswerBtn.addEventListener('click', handleCompleteAnswer);
    retryCompleteBtn.addEventListener('click', handleRetryComplete);
    gobackCompleteBtn.addEventListener('click', handleChangeMode);
    nextQuestionBtn.addEventListener('click', generateNewQuestion);
    gobackSpecificBtn.addEventListener('click', handleChangeMode);
    changeModeBtn.addEventListener('click', handleChangeMode);
    currentNotation = notationLatinRadio.checked ? 'latin' : 'english';
    updateUI();
});