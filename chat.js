// ========================================
// HOLOVISION AI - CHAT CORE
// PART 1: FIREBASE + CORE SETUP
// ========================================

import { model } from "./firebase-config.js";


// ========================================
// DOM ELEMENTS
// =======================================

const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("sendBtn");

const speakBtn = document.getElementById("speakBtn");
const voiceBtn =
    document.getElementById("voiceBtn") ||
    document.getElementById("voiceToolBtn");

const studyBtn = document.getElementById("studyBtn");
const clearBtn = document.getElementById("clearBtn");

const cameraBtn = document.getElementById("cameraBtn");
const uploadBtn = document.getElementById("uploadBtn");

const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

const answerBox = document.getElementById("answer");


// ========================================
// NAVIGATION ELEMENTS
// ========================================

const chatNavBtn = document.getElementById("chatNavBtn");
const studyNavBtn = document.getElementById("studyNavBtn");
const labNavBtn = document.getElementById("labNavBtn");
const homeNavBtn = document.getElementById("homeNavBtn");
const settingsNavBtn = document.getElementById("settingsNavBtn");


// ========================================
// SETTINGS ELEMENTS
// ========================================

const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn =
    document.getElementById("closeSettingsBtn");

const aiToggle = document.getElementById("aiToggle");
const speechToggle = document.getElementById("speechToggle");
const effectsToggle = document.getElementById("effectsToggle");

const settingsUserName =
    document.getElementById("settingsUserName");


// ========================================
// CORE STATE
// ========================================

let selectedImageFile = null;

let recognition = null;

let isListening = false;

let isSpeaking = false;

let currentAnswerText = "";


// ========================================
// AI STATE
// ========================================

let aiEnabled = true;

let speechEnabled = true;

let effectsEnabled = true;


// ========================================
// QUIZ STATE
// ========================================

let currentQuiz = null;
let currentQuizTopic = "";
let quizTimer = null;
let quizSeconds = 600;
let quizSubmitted = false;

// ========================================
// BASIC SAFETY CHECK
// ========================================

if (!questionInput) {
    console.warn("HoloVision AI: question input not found.");
}

if (!answerBox) {
    console.warn("HoloVision AI: answer container not found.");
}

if (!model) {
    console.error(
        "HoloVision AI: Gemini model is not available."
    );
}


// ========================================
// USER NAME
// ========================================

function getUserName() {

    const storedName =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("displayName");

    if (storedName && storedName.trim()) {
        return storedName.trim();
    }

    return "Student";
}


// ========================================
// CURRENT TIME
// ========================================

function getCurrentTime() {

    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


// ========================================
// SCROLL CHAT
// ========================================

function scrollChatToBottom() {

    if (!answerBox) {
        return;
    }

    answerBox.scrollTop = answerBox.scrollHeight;

}


// ========================================
// STOP SPEAKING
// ========================================

function stopSpeaking() {

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    isSpeaking = false;

}


// ========================================
// CLEANUP
// ========================================

function cleanupChatState() {

    stopSpeaking();

    if (recognition && isListening) {

        try {
            recognition.stop();
        } catch (error) {
            console.warn(
                "Voice recognition cleanup:",
                error
            );
        }

    }

    isListening = false;

}


// ========================================
// INITIAL CORE SETUP
// ========================================

function initializeChatCore() {

    console.log(
        "HoloVision AI: Chat core initialized."
    );

    console.log(
        "HoloVision AI: Firebase Gemini model connected."
    );

    const userName = getUserName();

    if (settingsUserName) {
        settingsUserName.textContent = userName;
    }

}


// ========================================
// PAGE CLEANUP
// ========================================

window.addEventListener(
    "beforeunload",
    cleanupChatState
);


// ========================================
// START
// ========================================

initializeChatCore();


// ========================================
// PART 1 COMPLETE
// ========================================

// ========================================
// HOLOVISION AI - PART 2
// HV CHAT + GEMINI AI RESPONSE
// CLEAN PROFESSIONAL CHAT UI
// ========================================


// ========================================
// ADD USER MESSAGE
// ========================================

function addUserMessage(text) {

    if (!answerBox) return;

    const message =
        document.createElement("div");

    message.className =
        "chat-message user";

    message.innerHTML = `
        <div class="message-wrap">

            <div class="message-content">

                <div class="message-bubble user-bubble">
                    ${escapeHTML(text)}
                </div>

                <div class="message-time">
                    ${getCurrentTime()}
                </div>

            </div>

        </div>
    `;

    answerBox.appendChild(message);

    hideWelcomeScreen();

    scrollChatToBottom();
}


// ========================================
// ADD AI LOADING MESSAGE
// ========================================

function addAILoading() {

    if (!answerBox) return null;

    const loading =
        document.createElement("div");

    loading.className =
        "chat-message ai";

    loading.innerHTML = `
        <div class="message-wrap">

            <div
                class="message-avatar ai-avatar"
                aria-hidden="true"
            >
                HV
            </div>

            <div class="message-content">

                <div class="message-bubble ai-bubble">

                    <div class="ai-loading">

                        <span></span>
                        <span></span>
                        <span></span>

                    </div>

                </div>

            </div>

        </div>
    `;

    answerBox.appendChild(loading);

    hideWelcomeScreen();

    scrollChatToBottom();

    return loading;
}


// ========================================
// ADD AI MESSAGE
// ========================================

function addAIMessage(text) {

    if (!answerBox) return;

    currentAnswerText =
        text || "";

    const message =
        document.createElement("div");

    message.className =
        "chat-message ai";

    message.innerHTML = `
        <div class="message-wrap">

            <div
                class="message-avatar ai-avatar"
                aria-hidden="true"
            >
                HV
            </div>

            <div class="message-content">

                <div class="message-bubble ai-bubble">

                    ${formatAIAnswer(text)}

                </div>

                <div class="message-time">
                    ${getCurrentTime()}
                </div>

            </div>

        </div>
    `;

    answerBox.appendChild(message);

    hideWelcomeScreen();

    scrollChatToBottom();
}


// ========================================
// HIDE WELCOME SCREEN
// ========================================

function hideWelcomeScreen() {

    if (!answerBox) return;

    const welcome =
        answerBox.querySelector(
            ".welcome-box"
        );

    if (welcome) {
        welcome.remove();
    }
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return "";
    }

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;
}


// ========================================
// FORMAT AI ANSWER
// ========================================

function formatAIAnswer(text) {

    if (!text) {
        return "No answer received.";
    }

    let safeText =
        escapeHTML(text);


    // ====================================
    // HEADINGS
    // ====================================

    safeText =
        safeText.replace(
            /^###\s*(.+)$/gm,
            "<h4>$1</h4>"
        );

    safeText =
        safeText.replace(
            /^##\s*(.+)$/gm,
            "<h3>$1</h3>"
        );

    safeText =
        safeText.replace(
            /^#\s*(.+)$/gm,
            "<h3>$1</h3>"
        );


    // ====================================
    // BOLD
    // ====================================

    safeText =
        safeText.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    // ====================================
    // BULLET POINTS
    // ====================================

    safeText =
        safeText.replace(
            /^[*-]\s+(.+)$/gm,
            `<div class="hv-bullet">
                <span class="hv-bullet-mark">•</span>
                <span>$1</span>
            </div>`
        );


    // ====================================
    // NUMBERED POINTS
    // ====================================

    safeText =
        safeText.replace(
            /^(\d+)\.\s+(.+)$/gm,
            `<div class="hv-number-point">
                <strong>$1.</strong>
                <span>$2</span>
            </div>`
        );


    // ====================================
    // LINE BREAKS
    // ====================================

    safeText =
        safeText.replace(
            /\n/g,
            "<br>"
        );


    return safeText;
}


// ========================================
// REMOVE LOADING MESSAGE
// ========================================

function removeAILoading(
    loadingElement
) {

    if (!loadingElement) return;

    if (loadingElement.parentNode) {
        loadingElement.remove();
    }
}


// ========================================
// AI ERROR MESSAGE
// ========================================

function showAIError(error) {

    console.error(
        "HoloVision AI Error:",
        error
    );

    if (!answerBox) return;


    const message =
        document.createElement("div");


    message.className =
        "chat-message ai";


    let errorText =
        "Sorry, I couldn't generate a response right now.";


    if (
        error &&
        typeof error.message === "string" &&
        error.message.trim()
    ) {

        const lower =
            error.message.toLowerCase();


        if (
            lower.includes("api") ||
            lower.includes("key") ||
            lower.includes("permission") ||
            lower.includes("unauthorized")
        ) {

            errorText =
                "AI connection issue detected. Please check the Firebase AI configuration.";

        } else if (
            lower.includes("network") ||
            lower.includes("fetch")
        ) {

            errorText =
                "Network connection issue. Please check your internet connection and try again.";
        }
    }


    message.innerHTML = `
        <div class="message-wrap">

            <div
                class="message-avatar ai-avatar"
                aria-hidden="true"
            >
                HV
            </div>

            <div class="message-content">

                <div class="message-bubble ai-bubble">

                    ${escapeHTML(errorText)}

                </div>

                <div class="message-time">
                    ${getCurrentTime()}
                </div>

            </div>

        </div>
    `;


    answerBox.appendChild(message);

    hideWelcomeScreen();

    scrollChatToBottom();
}


// ========================================
// AI PROMPT
// ========================================

function buildAIPrompt(userQuestion) {

    return `
You are HoloVision AI, an intelligent educational assistant.

The student asked:

"${userQuestion}"

Answer the question directly.

Rules:
- Use simple, student-friendly English.
- Be accurate and educational.
- Do not repeat the student's question.
- Do not start with "HOLOVISION AI".
- Give the most useful answer first.
- Use headings or bullet points when helpful.
- Give an example when it improves understanding.
- For technical questions, explain the steps clearly.
- For comparison questions, use a simple comparison.
- Do not add unnecessary information.
- Do not invent facts.
- Keep the response concise but complete.
`.trim();

}


// ========================================
// SEND QUESTION
// ========================================

async function sendQuestion() {

    if (!questionInput) return;


    const userQuestion =
        questionInput.value.trim();


    if (!userQuestion) {

        questionInput.focus();

        return;
    }


    if (!aiEnabled) {

        showAIError({
            message:
                "AI Assistant is disabled in Settings."
        });

        return;
    }


    if (!model) {

        showAIError({
            message:
                "Gemini model is not available."
        });

        return;
    }


    // Stop speech
    stopSpeaking();


    // ====================================
    // USER MESSAGE
    // ====================================

    addUserMessage(
        userQuestion
    );


    // Clear input
    questionInput.value = "";


    // ====================================
    // LOADING
    // ====================================

    const loading =
        addAILoading();


    // Disable send
    if (sendBtn) {
        sendBtn.disabled = true;
    }


    try {

        const prompt =
            buildAIPrompt(
                userQuestion
            );


        // =================================
        // GEMINI
        // =================================

        const result =
            await model.generateContent(
                prompt
            );


        const response =
            result.response;


        const answer =
            response.text();


        // Remove loading
        removeAILoading(
            loading
        );


        if (
            !answer ||
            !answer.trim()
        ) {

            showAIError({
                message:
                    "Empty AI response."
            });

            return;
        }


        // =================================
        // AI ANSWER
        // =================================

        addAIMessage(
            answer.trim()
        );


    } catch (error) {

        removeAILoading(
            loading
        );

        showAIError(
            error
        );

    } finally {

        if (sendBtn) {
            sendBtn.disabled = false;
        }

        questionInput.focus();
    }

}


// ========================================
// PART 2 COMPLETE
// ========================================
// ========================================
// HOLOVISION AI - PART 3
// SEND + ENTER CONTROL
// ========================================


// ========================================
// SEND BUTTON STATE
// ========================================

function setSendButtonState(isLoading) {

    if (!sendBtn) {
        return;
    }

    sendBtn.disabled = isLoading;

    if (isLoading) {

        sendBtn.classList.add("loading");

        // Preserve icon if the button has one
        if (!sendBtn.dataset.originalContent) {
            sendBtn.dataset.originalContent =
                sendBtn.innerHTML;
        }

        sendBtn.innerHTML = `
            <span class="hv-send-loader"></span>
            <span>Sending...</span>
        `;

    } else {

        sendBtn.classList.remove("loading");

        if (sendBtn.dataset.originalContent) {

            sendBtn.innerHTML =
                sendBtn.dataset.originalContent;

        }
    }
}


// ========================================
// INPUT VALIDATION
// ========================================

function validateQuestionInput() {

    if (!questionInput) {
        return false;
    }

    const value =
        questionInput.value.trim();

    if (!value) {

        questionInput.classList.add(
            "hv-input-error"
        );

        questionInput.focus();

        setTimeout(() => {

            questionInput.classList.remove(
                "hv-input-error"
            );

        }, 800);

        return false;
    }

    return true;
}


// ========================================
// INPUT CHANGE
// ========================================

if (questionInput) {

    questionInput.addEventListener(
        "input",
        () => {

            questionInput.classList.remove(
                "hv-input-error"
            );

        }
    );

}


// ========================================
// ENTER KEY CONTROL
// ========================================
//
// Enter = Send
// Shift + Enter = New line
//

if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.isComposing
            ) {

                event.preventDefault();

                if (
                    sendBtn &&
                    sendBtn.disabled
                ) {
                    return;
                }

                if (
                    validateQuestionInput()
                ) {

                    safeSendQuestion();

                }

            }

        }
    );

}

// ========================================
// SEND BUTTON EXTRA PROTECTION
// ========================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        () => {

            if (sendBtn.disabled) {
                return;
            }

            safeSendQuestion();

        }
    );

}


// ========================================
// PREVENT DOUBLE SUBMIT
// ========================================

let questionBeingSent = false;


// ========================================
// SAFE SEND WRAPPER
// ========================================

async function safeSendQuestion() {

    if (questionBeingSent) {
        return;
    }

    if (!validateQuestionInput()) {
        return;
    }

    questionBeingSent = true;

    setSendButtonState(true);

    try {

    if (studyModeActive) {

        await generateStudyNotes();

    } else {

        await sendQuestion();

    }

} catch (error) {

        console.error(
            "HoloVision AI send error:",
            error
        );

    } finally {

        questionBeingSent = false;

        setSendButtonState(false);

    }

}


// ========================================
// REPLACE DIRECT SEND LISTENERS
// ========================================
//
// PART 2 already attached listeners.
// To avoid duplicate requests, the original
// listeners must not be attached twice.
//
// The main send flow remains sendQuestion().
// This guard protects repeated clicks.
//

if (sendBtn) {

    sendBtn.addEventListener(
        "dblclick",
        (event) => {

            event.preventDefault();

        }
    );

}


// ========================================
// INPUT PLACEHOLDER
// ========================================

if (questionInput) {

    questionInput.setAttribute(
        "autocomplete",
        "off"
    );

    questionInput.setAttribute(
        "spellcheck",
        "true"
    );

}


// ========================================
// SEND BUTTON ACCESSIBILITY
// ========================================

if (sendBtn) {

    sendBtn.setAttribute(
        "type",
        "button"
    );

}


// ========================================
// PART 3 STYLES
// ========================================

const part3Style =
    document.createElement("style");

part3Style.id =
    "holovision-part3-style";

part3Style.textContent = `

    .hv-send-loader {

        width: 14px;
        height: 14px;

        border: 2px solid currentColor;
        border-top-color: transparent;

        border-radius: 50%;

        display: inline-block;

        animation:
            hvSendSpin 0.7s linear infinite;

    }


    @keyframes hvSendSpin {

        to {
            transform: rotate(360deg);
        }

    }


    .hv-input-error {

        animation:
            hvInputError 0.25s ease;

    }


    @keyframes hvInputError {

        0% {
            transform: translateX(0);
        }

        25% {
            transform: translateX(-4px);
        }

        50% {
            transform: translateX(4px);
        }

        75% {
            transform: translateX(-3px);
        }

        100% {
            transform: translateX(0);
        }

    }


    .sendBtn.loading,
    #sendBtn.loading {

        cursor: wait;

    }


    #sendBtn:disabled {

        opacity: 0.65;
        cursor: wait;

    }

`;

if (
    !document.getElementById(
        "holovision-part3-style"
    )
) {

    document.head.appendChild(
        part3Style
    );

}


// ========================================
// PART 3 COMPLETE
// ========================================

// ========================================
// HOLOVISION AI - PART 4
// READ ANSWER + STOP SPEAKING
// ========================================


// ========================================
// SPEECH SUPPORT CHECK
// ========================================

function isSpeechSupported() {

    return (
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window
    );

}


// ========================================
// GET LAST AI ANSWER
// ========================================

function getLatestAIAnswer() {

    if (currentAnswerText &&
        currentAnswerText.trim()) {

        return currentAnswerText.trim();

    }

    if (!answerBox) {
        return "";
    }

    const aiMessages =
        answerBox.querySelectorAll(
            ".hv-ai-message .hv-answer-text"
        );

    if (!aiMessages.length) {
        return "";
    }

    const latest =
        aiMessages[aiMessages.length - 1];

    return latest.innerText.trim();

}


// ========================================
// UPDATE SPEAK BUTTON
// ========================================

function updateSpeakButton(speaking) {

    if (!speakBtn) {
        return;
    }

    if (speaking) {

        speakBtn.classList.add(
            "speaking"
        );

        speakBtn.setAttribute(
            "aria-label",
            "Stop speaking"
        );

        speakBtn.setAttribute(
            "title",
            "Stop speaking"
        );

        // Keep existing button structure if possible
        const icon =
            speakBtn.querySelector("i");

        if (icon) {

            icon.className =
                "fas fa-stop";

        }

        const textNodes =
            [...speakBtn.childNodes]
                .filter(
                    node =>
                        node.nodeType ===
                        Node.TEXT_NODE &&
                        node.textContent.trim()
                );

        if (textNodes.length) {

            textNodes[
                textNodes.length - 1
            ].textContent =
                " Stop";

        }

    } else {

        speakBtn.classList.remove(
            "speaking"
        );

        speakBtn.setAttribute(
            "aria-label",
            "Read answer"
        );

        speakBtn.setAttribute(
            "title",
            "Read answer"
        );

        const icon =
            speakBtn.querySelector("i");

        if (icon) {

            icon.className =
                "fas fa-volume-up";

        }

        const textNodes =
            [...speakBtn.childNodes]
                .filter(
                    node =>
                        node.nodeType ===
                        Node.TEXT_NODE &&
                        node.textContent.trim()
                );

        if (textNodes.length) {

            textNodes[
                textNodes.length - 1
            ].textContent =
                " Read Answer";

        }

    }

}


// ========================================
// STOP SPEAKING
// ========================================

function stopAISpeaking() {

    if (isSpeechSupported()) {

        window.speechSynthesis.cancel();

    }

    isSpeaking = false;

    updateSpeakButton(false);

}


// ========================================
// SPEAK AI ANSWER
// ========================================

function speakAIAnswer() {

    // Speech disabled
    if (!speechEnabled) {

        return;

    }


    // Browser support
    if (!isSpeechSupported()) {

        console.warn(
            "Speech synthesis is not supported."
        );

        return;

    }


    // If already speaking → STOP
    if (isSpeaking) {

        stopAISpeaking();

        return;

    }


    const text =
        getLatestAIAnswer();


    // No answer available
    if (!text) {

        return;

    }


    // Stop any previous speech
    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(text);


    // Student-friendly voice settings
    utterance.lang = "en-IN";

    utterance.rate = 0.95;

    utterance.pitch = 1;

    utterance.volume = 1;


    // Speech started
    utterance.onstart = () => {

        isSpeaking = true;

        updateSpeakButton(true);

    };


    // Speech finished
    utterance.onend = () => {

        isSpeaking = false;

        updateSpeakButton(false);

    };


    // Speech cancelled/error
    utterance.onerror = () => {

        isSpeaking = false;

        updateSpeakButton(false);

    };


    window.speechSynthesis.speak(
        utterance
    );

}


// ========================================
// READ ANSWER BUTTON
// ========================================

if (speakBtn) {

    speakBtn.addEventListener(
        "click",
        speakAIAnswer
    );

}
// ========================================
// STOP WHEN PAGE CHANGES
// ========================================

window.addEventListener(
    "pagehide",
    stopAISpeaking
);


// ========================================
// PART 4 STYLES
// ========================================

const part4Style =
    document.createElement("style");

part4Style.id =
    "holovision-part4-style";

part4Style.textContent = `

    #speakBtn.speaking {

        cursor: pointer;

    }


    #speakBtn.speaking i {

        animation:
            hvSpeakPulse 1s ease-in-out infinite;

    }


    @keyframes hvSpeakPulse {

        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.15);
        }

        100% {
            transform: scale(1);
        }

    }

`;

if (
    !document.getElementById(
        "holovision-part4-style"
    )
) {

    document.head.appendChild(
        part4Style
    );

}


// ========================================
// PART 4 COMPLETE
// ========================================

// ========================================
// HOLOVISION AI - PART 5
// VOICE INPUT / SPEECH RECOGNITION
// ========================================


// ========================================
// SPEECH RECOGNITION SUPPORT
// ========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


// ========================================
// INITIALIZE VOICE RECOGNITION
// ========================================

function initializeVoiceRecognition() {

    if (!voiceBtn) {
        console.warn(
            "HoloVision AI: Voice button not found."
        );
        return;
    }

    if (!SpeechRecognition) {

        console.warn(
            "HoloVision AI: Speech Recognition is not supported in this browser."
        );

        voiceBtn.setAttribute(
            "title",
            "Voice input is not supported in this browser"
        );

        return;
    }


    recognition =
        new SpeechRecognition();


    // ====================================
    // VOICE SETTINGS
    // ====================================

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    // ====================================
    // VOICE START
    // ====================================

    recognition.onstart = () => {

        isListening = true;

        updateVoiceButton(true);

    };


    // ====================================
    // VOICE RESULT
    // ====================================

    recognition.onresult = (event) => {

        if (
            !event.results ||
            !event.results.length
        ) {
            return;
        }


        const result =
            event.results[
                event.results.length - 1
            ];


        if (
            !result ||
            !result[0]
        ) {
            return;
        }


        const transcript =
            result[0].transcript.trim();


        if (!transcript) {
            return;
        }


        if (questionInput) {

            questionInput.value =
                transcript;

            questionInput.focus();

        }

    };


    // ====================================
    // VOICE ERROR
    // ====================================

    recognition.onerror = (event) => {

        console.warn(
            "HoloVision AI Voice Error:",
            event.error
        );


        isListening = false;

        updateVoiceButton(false);


        if (
            event.error ===
            "not-allowed"
        ) {

            voiceBtn.setAttribute(
                "title",
                "Microphone permission is required"
            );

        } else if (
            event.error ===
            "no-speech"
        ) {

            voiceBtn.setAttribute(
                "title",
                "No speech detected"
            );

        } else {

            voiceBtn.setAttribute(
                "title",
                "Voice input"
            );

        }

    };


    // ====================================
    // VOICE END
    // ====================================

    recognition.onend = () => {

        isListening = false;

        updateVoiceButton(false);

    };

}


// ========================================
// UPDATE VOICE BUTTON
// ========================================

function updateVoiceButton(listening) {

    if (!voiceBtn) {
        return;
    }


    if (listening) {

        voiceBtn.classList.add(
            "listening"
        );


        voiceBtn.setAttribute(
            "aria-label",
            "Stop voice input"
        );


        voiceBtn.setAttribute(
            "title",
            "Stop listening"
        );


        const icon =
            voiceBtn.querySelector("i");


        if (icon) {

            icon.className =
                "fas fa-stop";

        }


        const textNodes =
            [...voiceBtn.childNodes]
                .filter(
                    node =>
                        node.nodeType ===
                        Node.TEXT_NODE &&
                        node.textContent.trim()
                );


        if (textNodes.length) {

            textNodes[
                textNodes.length - 1
            ].textContent =
                " Stop";

        }

    } else {

        voiceBtn.classList.remove(
            "listening"
        );


        voiceBtn.setAttribute(
            "aria-label",
            "Voice input"
        );


        voiceBtn.setAttribute(
            "title",
            "Voice input"
        );


        const icon =
            voiceBtn.querySelector("i");


        if (icon) {

            icon.className =
                "fas fa-microphone";

        }


        const textNodes =
            [...voiceBtn.childNodes]
                .filter(
                    node =>
                        node.nodeType ===
                        Node.TEXT_NODE &&
                        node.textContent.trim()
                );


        if (textNodes.length) {

            textNodes[
                textNodes.length - 1
            ].textContent =
                " Speak";

        }

    }

}


// ========================================
// START VOICE
// ========================================

function startVoiceInput() {

    if (!speechEnabled) {

        return;

    }


    if (!recognition) {

        initializeVoiceRecognition();

    }


    if (!recognition) {

        return;

    }


    if (isListening) {

        stopVoiceInput();

        return;

    }


    // Stop AI speech before listening
    stopAISpeaking();


    try {

        recognition.start();

    } catch (error) {

        console.warn(
            "Voice start error:",
            error
        );

    }

}


// ========================================
// STOP VOICE
// ========================================

function stopVoiceInput() {

    if (
        recognition &&
        isListening
    ) {

        try {

            recognition.stop();

        } catch (error) {

            console.warn(
                "Voice stop error:",
                error
            );

        }

    }


    isListening = false;

    updateVoiceButton(false);

}


// ========================================
// VOICE BUTTON
// ========================================

if (voiceBtn) {

    voiceBtn.addEventListener(
        "click",
        startVoiceInput
    );

}
// ========================================
// CLEANUP VOICE
// ========================================

window.addEventListener(
    "beforeunload",
    () => {

        stopVoiceInput();

    }
);


// ========================================
// INITIALIZE
// ========================================

initializeVoiceRecognition();


// ========================================
// PART 5 COMPLETE
// ========================================
// ========================================
// HOLOVISION AI - PART 6
// STUDY MODE
// ========================================

// ========================================
// STUDY MODE PROMPT
// ========================================
function buildStudyPrompt(topic) {
    return `
You are HoloVision AI Study Mode, an educational assistant.

The student wants to study this topic:
"${topic}"

Create clear study notes for a student.

Use EXACTLY these five sections:
1. Definition
2. Simple Explanation
3. Important Points
4. Example
5. Short Exam Revision Points

Rules:
- Use simple student-friendly English.
- Keep each section concise but useful.
- Explain the topic accurately.
- Use bullet points where helpful.
- Give one clear example.
- Make the revision points easy to remember.
- Do not repeat the student's question.
- Do not invent facts.
- Do not add extra sections.
- Do not start with "HOLOVISION AI".
`.trim();
}


// ========================================
// STUDY MODE PAGE TITLE / ICON
// ========================================

let studyModeActive = false;



function setStudyModeHeader(isStudyMode) {

    const headings = Array.from(
        document.querySelectorAll(
            ".page-title, .hv-page-title, .section-title, .page-heading, h1"
        )
    );

    let heading = null;

    for (const element of headings) {

        const text = element.textContent
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

        if (
            text === "ai chat" ||
            text === "study mode" ||
            text.includes("ai chat") ||
            text.includes("study mode")
        ) {
            heading = element;
            break;
        }
    }

    if (!heading) {
        return;
    }

    // ----------------------------------------
    // Change title text
    // ----------------------------------------
    const titleText = isStudyMode ? "Study Mode" : "AI Chat";

    let titleElement =
        heading.querySelector(".page-title-text") ||
        heading.querySelector(".hv-page-title-text") ||
        heading.querySelector(".title-text") ||
        heading.querySelector(".section-title-text");

    if (titleElement) {

        titleElement.textContent = titleText;

    } else {

        // Find heading text node
        const walker = document.createTreeWalker(
            heading,
            NodeFilter.SHOW_TEXT
        );

        let textNode = null;

        while (walker.nextNode()) {

            const value = walker.currentNode.textContent
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase();

            if (
                value === "ai chat" ||
                value === "study mode"
            ) {
                textNode = walker.currentNode;
                break;
            }
        }

        if (textNode) {
            textNode.textContent = titleText;
        }
    }


    // ----------------------------------------
    // SVG icons
    // ----------------------------------------
    const chatIcon = `
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5
                     8.8 8.8 0 0 1-4.2-1.1
                     L3 20l1.2-4.1
                     A8.2 8.2 0 0 1 3 11.5
                     8.4 8.4 0 0 1 12 3
                     a8.4 8.4 0 0 1 9 8.5Z"/>
        </svg>
    `;

    const studyIcon = `
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
            <path d="M8 6h8"/>
            <path d="M8 10h8"/>
            <path d="M8 14h5"/>
        </svg>
    `;


    // ----------------------------------------
    // Find existing title icon container
    // ----------------------------------------
    let iconContainer =
        heading.querySelector(".page-title-icon") ||
        heading.querySelector(".hv-page-title-icon") ||
        heading.querySelector(".title-icon") ||
        heading.querySelector(".section-title-icon") ||
        heading.parentElement?.querySelector(".page-title-icon") ||
        heading.parentElement?.querySelector(".hv-page-title-icon") ||
        heading.parentElement?.querySelector(".title-icon") ||
        heading.parentElement?.querySelector(".section-title-icon");


    // ----------------------------------------
    // If icon container exists
    // ----------------------------------------
    if (iconContainer) {

        iconContainer.innerHTML =
            isStudyMode ? studyIcon : chatIcon;

        iconContainer.setAttribute(
            "aria-label",
            isStudyMode ? "Study Mode" : "AI Chat"
        );

        iconContainer.setAttribute(
            "title",
            isStudyMode ? "Study Mode" : "AI Chat"
        );

        return;
    }


    // ----------------------------------------
    // Fallback:
    // create icon before heading
    // ----------------------------------------
    const newIcon = document.createElement("span");

    newIcon.className = "hv-mode-title-icon";

    newIcon.innerHTML =
        isStudyMode ? studyIcon : chatIcon;

    newIcon.setAttribute(
        "aria-label",
        isStudyMode ? "Study Mode" : "AI Chat"
    );

    newIcon.setAttribute(
        "title",
        isStudyMode ? "Study Mode" : "AI Chat"
    );

    newIcon.style.display = "inline-flex";
    newIcon.style.alignItems = "center";
    newIcon.style.justifyContent = "center";
    newIcon.style.marginRight = "10px";
    newIcon.style.verticalAlign = "middle";

    heading.insertBefore(
        newIcon,
        heading.firstChild
    );
}


// ========================================
// STUDY MODE LOADING
// ========================================
function addStudyLoading() {

    if (!answerBox) {
        return null;
    }

    const loading = document.createElement("div");

    loading.className =
        "hv-chat-message hv-ai-message hv-study-loading";

    loading.innerHTML = `
        <div class="hv-avatar hv-ai-avatar">
            <span>HV</span>
        </div>

        <div class="hv-message-content">

            <div class="hv-bubble hv-ai-bubble">

                <div class="hv-thinking">
                    <span></span>
                    <span></span>
                    <span></span>
                    <em>Creating study notes...</em>
                </div>

            </div>

        </div>
    `;

    answerBox.appendChild(loading);

    scrollChatToBottom();

    return loading;
}


// ========================================
// REMOVE STUDY LOADING
// ========================================
function removeStudyLoading(loadingElement) {

    if (
        loadingElement &&
        loadingElement.parentNode
    ) {
        loadingElement.remove();
    }
}


// ========================================
// SHOW STUDY MODE RESULT
// ========================================
function addStudyResult(topic, answer) {

    if (!answerBox) {
        return;
    }

    currentAnswerText = answer || "";

    const message = document.createElement("div");

    message.className =
        "hv-chat-message hv-ai-message hv-study-message";

    message.innerHTML = `
        <div class="hv-avatar hv-ai-avatar">
            <span>HV</span>
        </div>

        <div class="hv-message-content">

            <div class="hv-bubble hv-study-bubble">

                <div class="hv-study-title">
                    <span class="hv-study-icon">
                        <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
                            <path d="M8 6h8"/>
                            <path d="M8 10h8"/>
                            <path d="M8 14h5"/>
                        </svg>
                    </span>

                    <span>STUDY MODE</span>
                </div>

                <div class="hv-study-topic">
                    ${escapeHTML(topic)}
                </div>

                <div class="hv-answer-text">
                    ${formatAIAnswer(answer)}
                </div>

            </div>

            <div class="hv-message-time">
                ${getCurrentTime()}
            </div>

        </div>
    `;

    answerBox.appendChild(message);

    scrollChatToBottom();
}


// ========================================
// STUDY MODE ERROR
// ========================================
function showStudyError(error) {

    console.error(
        "HoloVision Study Mode Error:",
        error
    );

    if (!answerBox) {
        return;
    }

    const message = document.createElement("div");

    message.className =
        "hv-chat-message hv-ai-message hv-error-message";

    let errorText =
        "Study Mode couldn't generate notes right now. Please try again.";

    // Show useful Firebase AI error information
    if (
        error &&
        typeof error.code === "string"
    ) {

        if (error.code === "fetch-error") {

            errorText =
                "AI connection failed. Please check Firebase AI Logic, App Check, and internet connection.";

        } else if (error.code === "api-not-enabled") {

            errorText =
                "Firebase AI Logic is not enabled for this project.";

        } else if (error.code === "no-api-key") {

            errorText =
                "Firebase AI configuration is missing the required API setup.";

        } else if (error.code === "no-model") {

            errorText =
                "The Gemini model is not available.";

        } else if (error.code === "request-error") {

            errorText =
                "The AI request was rejected. Please check the Firebase AI configuration.";

        } else if (error.code === "response-error") {

            errorText =
                "The AI service returned an error. Please try again.";
        }
    }

    message.innerHTML = `
        <div class="hv-avatar hv-ai-avatar">
            <span>HV</span>
        </div>

        <div class="hv-message-content">

            <div class="hv-bubble hv-error-bubble">

                <div class="hv-answer-text">
                    ${escapeHTML(errorText)}
                </div>

            </div>

            <div class="hv-message-time">
                ${getCurrentTime()}
            </div>

        </div>
    `;

    answerBox.appendChild(message);

    scrollChatToBottom();
}


// ========================================
// STOP SPEECH SAFELY
// ========================================
function stopStudySpeechSafely() {

    try {

        if (
            typeof stopAISpeaking === "function"
        ) {
            stopAISpeaking();
            return;
        }

        if (
            typeof stopSpeaking === "function"
        ) {
            stopSpeaking();
            return;
        }

        if (
            "speechSynthesis" in window
        ) {
            window.speechSynthesis.cancel();
        }

    } catch (error) {

        console.warn(
            "Speech stop warning:",
            error
        );
    }
}


// ========================================
// GENERATE STUDY NOTES
// ========================================
async function generateStudyNotes() {

    if (!questionInput) {
        return;
    }

    const topic =
        questionInput.value.trim();

    if (!topic) {

        questionInput.focus();

        questionInput.classList.add(
            "hv-input-error"
        );

        setTimeout(() => {

            questionInput.classList.remove(
                "hv-input-error"
            );

        }, 800);

        return;
    }


    // ----------------------------------------
    // Check AI
    // ----------------------------------------
    if (!aiEnabled) {

        showStudyError({
            code: "ai-disabled",
            message: "AI Assistant is disabled."
        });

        return;
    }


    if (!model) {

        showStudyError({
            code: "no-model",
            message: "Gemini model is unavailable."
        });

        return;
    }


    // ----------------------------------------
    // Stop speech
    // ----------------------------------------
    stopStudySpeechSafely();


    // ----------------------------------------
    // Student message
    // ----------------------------------------
    addUserMessage(topic);


    // ----------------------------------------
    // Clear input
    // ----------------------------------------
    questionInput.value = "";


    // ----------------------------------------
    // Loading
    // ----------------------------------------
    const loading =
        addStudyLoading();


    if (studyBtn) {
        studyBtn.disabled = true;
    }


    try {

        const prompt =
            buildStudyPrompt(topic);

        console.log(
            "HoloVision Study Mode: Sending request..."
        );

        const result =
            await model.generateContent(prompt);

        const response =
            result.response;

        const answer =
            response.text();


        removeStudyLoading(loading);


        if (
            !answer ||
            !answer.trim()
        ) {

            showStudyError({
                code: "response-error",
                message: "Empty Study Mode response."
            });

            return;
        }


        console.log(
            "HoloVision Study Mode: Response received."
        );


        addStudyResult(
            topic,
            answer.trim()
        );

        } catch (error) {

        removeStudyLoading(loading);

        console.error(
            "HoloVision Study Mode Error:",
            error
        );

        console.error(
            "Study Error Code:",
            error?.code
        );

        console.error(
            "Study Error Message:",
            error?.message
        );

        console.error(
            "Study Error Details:",
            error?.customData ||
            error?.customErrorData ||
            error
        );

        showStudyError(error);

    } finally {
        if (studyBtn) {
            studyBtn.disabled = false;
        }

        questionInput.focus();
    }
}


// ========================================
// STUDY BUTTON
// ========================================
if (studyBtn) {

    studyBtn.addEventListener(
        "click",
        generateStudyNotes
    );
}


// ========================================
// STUDY MODE NAV BUTTON
// ========================================
if (studyNavBtn) {

    studyNavBtn.addEventListener(
        "click",
        () => {

            // Change page heading + icon
            setStudyModeHeader(true);

            if (questionInput) {

                questionInput.placeholder =
                    "Enter a topic to create study notes...";

                questionInput.focus();
            }
        }
    );
}
// ========================================
// AI CHAT NAV BUTTON
// ========================================
const hvAIChatNavBtn =
    document.getElementById("aiChatNavBtn") ||
    document.getElementById("chatNavBtn") ||
    document.getElementById("aiChatBtn") ||
    document.querySelector('[data-mode="ai-chat"]') ||
    document.querySelector('[data-page="ai-chat"]');

if (hvAIChatNavBtn) {

    hvAIChatNavBtn.addEventListener(
        "click",
        () => {

            setStudyModeHeader(false);

            if (questionInput) {

                questionInput.placeholder =
                    "Ask HoloVision AI anything...";

            }
        }
    );
}

// ========================================
// STUDY MODE STYLES
// ========================================
if (
    !document.getElementById(
        "holovision-part6-style"
    )
) {

    const part6Style =
        document.createElement("style");

    part6Style.id =
        "holovision-part6-style";

    part6Style.textContent = `

        .hv-study-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: Orbitron, sans-serif;
            font-weight: 700;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
        }

        .hv-study-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .hv-study-icon svg {
            display: block;
        }

        .hv-study-topic {
            font-size: 13px;
            opacity: 0.7;
            margin-bottom: 14px;
        }

        .hv-study-message {
            margin-bottom: 14px;
        }

        .hv-study-bubble h3,
        .hv-study-bubble h4 {
            margin-top: 12px;
            margin-bottom: 7px;
        }

        .hv-study-bubble .hv-bullet {
            margin: 4px 0;
            line-height: 1.55;
        }

        .hv-study-bubble .hv-number-point {
            margin: 5px 0;
            line-height: 1.55;
        }

        .hv-study-loading {
            opacity: 0.95;
        }

        .hv-mode-title-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .hv-mode-title-icon svg {
            display: block;
        }

        .hv-study-bubble {
            overflow-wrap: anywhere;
        }

    `;

    document.head.appendChild(
        part6Style
    );
}


// ========================================
// PART 6 COMPLETE
// ========================================
console.log(
    "HoloVision AI - Part 6 loaded successfully."
);

// ========================================
// HOLOVISION AI - PART 7
// CAMERA + UPLOAD + AI IMAGE ANALYSIS
// ========================================


// ========================================
// IMAGE INPUT SETTINGS
// ========================================

if (imageInput) {
    imageInput.setAttribute("accept", "image/*");
}


// ========================================
// IMAGE PREVIEW INSIDE CHAT
// ========================================

function showImagePreview(file) {

    if (!answerBox || !file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {

        const imageData = event.target.result;

        // Remove old standalone preview
        if (imagePreview) {
            imagePreview.innerHTML = "";
            imagePreview.style.display = "none";
        }

        // Remove previous pending image message
        const oldImageMessage =
            document.getElementById("hv-pending-image-message");

        if (oldImageMessage) {
            oldImageMessage.remove();
        }

        // Create image as a USER chat message
        const message =
            document.createElement("div");

        message.className =
            "hv-chat-message hv-user-message hv-image-user-message";

        message.id =
            "hv-pending-image-message";

        message.innerHTML = `

            <div class="hv-message-content">

                <div class="hv-bubble hv-user-bubble hv-image-bubble">

                    <div class="hv-image-chat-label">
                        <i class="fas fa-image"></i>
                        Image
                    </div>

                    <img
                        src="${imageData}"
                        alt="Selected image"
                        class="hv-chat-image"
                    >

                    <div class="hv-image-actions">

                        <button
                            type="button"
                            class="hv-analyze-image-btn"
                            id="analyzeImageBtn"
                        >
                            <i class="fas fa-wand-magic-sparkles"></i>
                            Analyze with AI
                        </button>

                        <button
                            type="button"
                            class="hv-remove-image"
                            id="removeImageBtn"
                        >
                            <i class="fas fa-times"></i>
                            Remove
                        </button>

                    </div>

                </div>

                <div class="hv-message-time">
                    ${getCurrentTime()}
                </div>

            </div>
        `;

        answerBox.appendChild(message);

        const analyzeBtn =
            document.getElementById(
                "analyzeImageBtn"
            );

        if (analyzeBtn) {

            analyzeBtn.addEventListener(
                "click",
                analyzeImageWithAI
            );

        }

        const removeBtn =
            document.getElementById(
                "removeImageBtn"
            );

        if (removeBtn) {

            removeBtn.addEventListener(
                "click",
                clearSelectedImage
            );

        }

        scrollChatToBottom();
    };

    reader.onerror = () => {

        console.error(
            "HoloVision: Unable to preview image."
        );

    };

    reader.readAsDataURL(file);
}


// ========================================
// CLEAR SELECTED IMAGE
// ========================================

function clearSelectedImage() {

    selectedImageFile = null;

    if (imageInput) {
        imageInput.value = "";
    }

    if (imagePreview) {
        imagePreview.innerHTML = "";
        imagePreview.style.display = "none";
    }

    const pendingImage =
        document.getElementById(
            "hv-pending-image-message"
        );

    if (pendingImage) {
        pendingImage.remove();
    }
}


// ========================================
// VALIDATE IMAGE
// ========================================

// ========================================
// VALIDATE UPLOAD IMAGE
// ========================================

function isValidImage(file) {

    if (!file) {
        return false;
    }

    const supportedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!supportedTypes.includes(file.type)) {

        console.warn(
            "HoloVision: Unsupported image type:",
            file.type
        );

        return false;
    }

    // Keep upload safely below Firebase inline request limit
    if (file.size > 8 * 1024 * 1024) {

        console.warn(
            "HoloVision: Image is larger than 8 MB."
        );

        return false;
    }

    return true;
}

// ========================================
// UPLOAD IMAGE BUTTON
// ========================================

if (uploadBtn) {

    uploadBtn.addEventListener(
        "click",
        () => {

            if (!imageInput) {
                return;
            }

            imageInput.removeAttribute("capture");

            imageInput.setAttribute(
                "accept",
                "image/*"
            );

            imageInput.click();

        }
    );

}


// ========================================
// CAMERA BUTTON
// ========================================

if (cameraBtn) {

    cameraBtn.addEventListener(
        "click",
        () => {

            if (!imageInput) {
                return;
            }

            imageInput.setAttribute(
                "accept",
                "image/*"
            );

            imageInput.setAttribute(
                "capture",
                "environment"
            );

            imageInput.click();

        }
    );

}


// ========================================
// IMAGE SELECTED
// ========================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        () => {

            const file =
                imageInput.files &&
                imageInput.files[0];

            if (!file) {
                return;
            }

            if (!isValidImage(file)) {

    clearSelectedImage();

    showImageAnalysisError({
        message:
            "Unsupported image. Please choose a JPG, JPEG, PNG, or WebP image under 8 MB."
    });

    return;
}

            selectedImageFile = file;

            console.log(
                "HoloVision image selected:",
                file.name,
                file.type,
                file.size
            );

            showImagePreview(file);

        }
    );

}


// ========================================
// FILE → BASE64
// ========================================

// ========================================
// FILE → BASE64
// ========================================

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        if (!file) {
            reject(new Error("No image selected."));
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {

            if (typeof reader.result !== "string") {
                reject(new Error("Unable to read image."));
                return;
            }

            const parts = reader.result.split(",");

            if (parts.length < 2) {
                reject(new Error("Invalid image data."));
                return;
            }

            const base64 = parts[1];

            if (!base64) {
                reject(new Error("Image data is empty."));
                return;
            }

            resolve(base64);
        };

        reader.onerror = () => {
            reject(new Error("Failed to read image."));
        };

        reader.readAsDataURL(file);
    });
}

// ========================================
// IMAGE ANALYSIS PROMPT
// ========================================

function buildImagePrompt() {

    return `
You are HoloVision AI, an intelligent educational visual assistant.

Analyze the uploaded image carefully.

Give the student a clear educational explanation based only on what can reasonably be identified from the image.

Use this structure when applicable:

1. What the image represents
2. Visible parts or components
3. Function or purpose
4. Simple explanation
5. Important educational points
6. Clearly readable text

Rules:
- Use simple student-friendly English.
- Be accurate.
- Do not invent details.
- Do not make unsupported assumptions.
- If part of the image is unclear, say so.
- If readable text is present, explain it accurately.
- Keep the answer concise but useful.
- Do not repeat these instructions.
`.trim();

}


// ========================================
// IMAGE ANALYSIS LOADING
// ========================================

function addImageAnalysisLoading() {

    if (!answerBox) {
        return null;
    }

    const loading =
        document.createElement("div");

    loading.className =
        "hv-chat-message hv-ai-message hv-image-loading";

    loading.innerHTML = `

        <div class="hv-avatar hv-ai-avatar">
            <span>HV</span>
        </div>

        <div class="hv-message-content">

            <div class="hv-bubble hv-ai-bubble">

                <div class="hv-image-analysis-title">
                    <i class="fas fa-sparkles"></i>
                    AI IMAGE ANALYSIS
                </div>

                <div class="hv-thinking">

                    <span></span>
                    <span></span>
                    <span></span>

                    <em>
                        Analyzing image...
                    </em>

                </div>

            </div>

        </div>
    `;

    answerBox.appendChild(loading);

    scrollChatToBottom();

    return loading;
}


// ========================================
// REMOVE IMAGE LOADING
// ========================================

function removeImageAnalysisLoading(loading) {

    if (
        loading &&
        loading.parentNode
    ) {

        loading.remove();

    }
}


// ========================================
// SHOW IMAGE ANALYSIS RESULT
// ========================================

function addImageAnalysisResult(answer) {

    if (!answerBox) {
        return;
    }

    currentAnswerText =
        answer || "";

    // Remove pending image controls after analysis
    const pendingImage =
        document.getElementById(
            "hv-pending-image-message"
        );

    if (pendingImage) {

        const analyzeBtn =
            pendingImage.querySelector(
                "#analyzeImageBtn"
            );

        const removeBtn =
            pendingImage.querySelector(
                "#removeImageBtn"
            );

        if (analyzeBtn) {
            analyzeBtn.remove();
        }

        if (removeBtn) {
            removeBtn.remove();
        }

        pendingImage.removeAttribute(
            "id"
        );
    }

    const message =
        document.createElement("div");

    message.className =
        "hv-chat-message hv-ai-message hv-image-result-message";

    message.innerHTML = `

        <div class="hv-avatar hv-ai-avatar">
            <span>HV</span>
        </div>

        <div class="hv-message-content">

            <div class="hv-bubble hv-ai-bubble">

                <div class="hv-image-analysis-title">
                    <i class="fas fa-sparkles"></i>
                    AI IMAGE ANALYSIS
                </div>

                <div class="hv-answer-text">
                    ${formatAIAnswer(answer)}
                </div>

            </div>

            <div class="hv-message-time">
                ${getCurrentTime()}
            </div>

        </div>
    `;

    answerBox.appendChild(message);

    scrollChatToBottom();
}


// ========================================
// IMAGE ANALYSIS ERROR
// ========================================

function showImageAnalysisError(error) {

    console.error(
        "HoloVision Image Analysis Error:",
        error
    );

    if (!answerBox) {
        return;
    }

    let errorText =
        "I couldn't analyze this image right now. Please try again.";

    if (
        error &&
        typeof error.message === "string"
    ) {

        const lower =
            error.message.toLowerCase();

        if (
            lower.includes("403") ||
            lower.includes("appcheck") ||
            lower.includes("app check")
        ) {

            errorText =
                "AI image analysis is blocked by App Check. Please refresh the application and try again.";

        } else if (
            lower.includes("network") ||
            lower.includes("fetch")
        ) {

            errorText =
                "Network connection issue. Please check your internet connection and try again.";

        } else if (
            lower.includes("quota") ||
            lower.includes("resource exhausted")
        ) {

            errorText =
                "AI usage limit was reached. Please try again later.";

        } else if (
            lower.includes("unsupported") ||
            lower.includes("mime")
        ) {

            errorText =
                "This image format is not supported. Please try another image.";

        }

    }

    const message =
        document.createElement("div");

    message.className =
        "hv-chat-message hv-ai-message hv-error-message";

    message.innerHTML = `

        <div class="hv-avatar hv-ai-avatar">
            <span>HV</span>
        </div>

        <div class="hv-message-content">

            <div class="hv-bubble hv-error-bubble">

                <div class="hv-image-analysis-title">
                    <i class="fas fa-triangle-exclamation"></i>
                    IMAGE ANALYSIS
                </div>

                <div class="hv-answer-text">
                    ${escapeHTML(errorText)}
                </div>

            </div>

            <div class="hv-message-time">
                ${getCurrentTime()}
            </div>

        </div>
    `;

    answerBox.appendChild(message);

    scrollChatToBottom();
}


// ========================================
// ANALYZE IMAGE WITH GEMINI
// ========================================

async function analyzeImageWithAI() {

    if (!selectedImageFile) {

        showImageAnalysisError({
            message:
                "No image selected."
        });

        return;
    }

    if (!aiEnabled) {

        showImageAnalysisError({
            message:
                "AI Assistant is disabled."
        });

        return;
    }

    if (!model) {

        showImageAnalysisError({
            message:
                "Gemini model is unavailable."
        });

        return;
    }

    stopAISpeaking();

    const file =
        selectedImageFile;

    const analyzeBtn =
        document.getElementById(
            "analyzeImageBtn"
        );

    if (analyzeBtn) {

        analyzeBtn.disabled = true;

        analyzeBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Analyzing...
        `;
    }

    const loading =
        addImageAnalysisLoading();

    try {

        console.log(
            "HoloVision: Starting image analysis..."
        );

        const base64 =
            await fileToBase64(file);

        const prompt =
            buildImagePrompt();

        console.log(
    "HoloVision Upload:",
    file.name,
    file.type,
    file.size
);

const result = await model.generateContent([
    prompt,
    {
        inlineData: {
            data: base64,
            mimeType: file.type
        }
    }
]);

        const response =
            result.response;

        if (!response) {

            throw new Error(
                "No response received from Gemini."
            );

        }

        const answer =
            response.text();

        removeImageAnalysisLoading(
            loading
        );

        if (
            !answer ||
            !answer.trim()
        ) {

            throw new Error(
                "Empty image analysis response."
            );

        }

        console.log(
            "HoloVision: Image analysis completed."
        );

        addImageAnalysisResult(
            answer.trim()
        );

    } catch (error) {

        removeImageAnalysisLoading(
            loading
        );

        console.error(
            "HoloVision Gemini Image Error:",
            error
        );

        showImageAnalysisError(
            error
        );

    } finally {

        if (analyzeBtn) {

            analyzeBtn.disabled = false;

            analyzeBtn.innerHTML = `
                <i class="fas fa-wand-magic-sparkles"></i>
                Analyze with AI
            `;

        }

    }

}


// ========================================
// PART 7 STYLES
// ========================================

const part7Style =
    document.createElement("style");

part7Style.id =
    "holovision-part7-style";

part7Style.textContent = `

    /* ==================================
       IMAGE INSIDE CHAT
       ================================== */

    .hv-image-user-message {
        justify-content: flex-end;
        margin-top: 16px;
        margin-bottom: 16px;
    }

    .hv-image-user-message
    .hv-message-content {
        align-items: flex-end;
        max-width: min(82%, 520px);
    }

    .hv-image-bubble {
        padding: 10px;
        border-radius: 16px;
        overflow: hidden;
    }

    .hv-image-chat-label {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 4px 6px 9px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    .hv-chat-image {
        display: block;
        width: 100%;
        max-width: 360px;
        max-height: 320px;
        object-fit: contain;
        border-radius: 11px;
    }

    .hv-image-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
        padding: 2px;
    }

    .hv-analyze-image-btn,
    .hv-remove-image {
        border: 0;
        border-radius: 9px;
        padding: 9px 12px;
        cursor: pointer;
        font-family: Poppins, Arial, sans-serif;
        font-size: 12px;
        font-weight: 600;
        transition:
            transform 0.2s ease,
            opacity 0.2s ease,
            box-shadow 0.2s ease;
    }

    .hv-analyze-image-btn:hover,
    .hv-remove-image:hover {
        transform: translateY(-1px);
    }

    .hv-analyze-image-btn:disabled {
        opacity: 0.6;
        cursor: wait;
        transform: none;
    }

    .hv-image-analysis-title {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.8px;
        margin-bottom: 10px;
    }

    .hv-image-loading {
        margin-bottom: 10px;
    }

    .hv-image-result-message {
        margin-bottom: 14px;
    }

    /* ==================================
       REMOVE STANDALONE PREVIEW
       ================================== */

    #imagePreview {
        display: none !important;
    }

    /* ==================================
       MOBILE
       ================================== */

    @media (max-width: 600px) {

        .hv-image-user-message
        .hv-message-content {
            max-width: 88%;
        }

        .hv-chat-image {
            width: 100%;
            max-width: 300px;
            max-height: 260px;
        }

        .hv-image-actions {
            flex-direction: column;
        }

        .hv-analyze-image-btn,
        .hv-remove-image {
            width: 100%;
            min-height: 40px;
        }

    }

`;

if (
    !document.getElementById(
        "holovision-part7-style"
    )
) {

    document.head.appendChild(
        part7Style
    );
}


// ========================================
// PART 7 COMPLETE
// ========================================

console.log(
    "HoloVision AI Part 7 loaded successfully."
);
  


// ========================================
// HOLOVISION AI - PART 8
// CLEAR CHAT + COMPLETE RESET
// ========================================


// ========================================
// CLEAR CHAT DISPLAY
// ========================================

function clearChatDisplay() {

    if (!answerBox) {
        return;
    }


    answerBox.innerHTML = `
        <div class="hv-welcome-screen">

            <div class="hv-welcome-avatar">
                <span>HV</span>
            </div>

            <h2>
                Welcome to HoloVision AI
            </h2>

            <p>
                Your intelligent learning assistant
            </p>

        </div>
    `;

}


// ========================================
// RESET INPUT
// ========================================

function resetQuestionInput() {

    if (!questionInput) {
        return;
    }


    questionInput.value = "";


    questionInput.classList.remove(
        "hv-input-error"
    );


    questionInput.placeholder =
        "Ask HoloVision AI anything...";

}


// ========================================
// RESET IMAGE
// ========================================

function resetImageState() {

    selectedImageFile = null;


    if (imageInput) {

        imageInput.value = "";

        imageInput.removeAttribute(
            "capture"
        );

    }


    if (imagePreview) {

        imagePreview.innerHTML = "";

    }

}


// ========================================
// RESET VOICE
// ========================================

function resetVoiceState() {

    if (
        recognition &&
        isListening
    ) {

        try {

            recognition.stop();

        } catch (error) {

            console.warn(
                "Voice reset:",
                error
            );

        }

    }


    isListening = false;


    updateVoiceButton(false);

}


// ========================================
// RESET SPEECH
// ========================================

function resetSpeechState() {

    stopAISpeaking();

    isSpeaking = false;

    updateSpeakButton(false);

}


// ========================================
// RESET QUIZ
// ========================================

function resetQuizState() {

    if (quizTimer) {

        clearInterval(
            quizTimer
        );

        quizTimer = null;

    }


    currentQuiz = null;

    quizSeconds = 600;

    quizSubmitted = false;

}


// ========================================
// REMOVE QUIZ UI
// ========================================

function removeQuizUI() {

    const quizContainers =
        document.querySelectorAll(
            ".hv-quiz-container, .quiz-container, #quizContainer"
        );


    quizContainers.forEach(
        element => element.remove()
    );

}


// ========================================
// RESET TEMPORARY IMAGE BUTTONS
// ========================================

function removeTemporaryImageButtons() {

    const buttons =
        document.querySelectorAll(
            "#analyzeImageBtn, #removeImageBtn"
        );


    buttons.forEach(
        button => button.remove()
    );

}


// ========================================
// COMPLETE CLEAR
// ========================================

function clearAllChatData() {

    // Stop speech
    resetSpeechState();


    // Stop voice
    resetVoiceState();


    // Reset input
    resetQuestionInput();


    // Reset image
    resetImageState();


    // Remove quiz
    resetQuizState();

    removeQuizUI();


    // Remove temporary controls
    removeTemporaryImageButtons();


    // Clear chat
    clearChatDisplay();


    // Reset current answer
    currentAnswerText = "";


    // Focus input
    if (questionInput) {

        questionInput.focus();

    }


    console.log(
        "HoloVision AI: Chat cleared successfully."
    );

}


// ========================================
// CLEAR BUTTON
// ========================================

if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        clearAllChatData
    );

}


// ========================================
// CLEAR IMAGE WHEN CHAT IS CLEARED
// ========================================

if (imageInput) {

    imageInput.addEventListener(
        "click",
        () => {

            // Prevent stale capture mode
            // when selecting a normal upload.

            if (
                imageInput.hasAttribute(
                    "capture"
                )
            ) {

                return;

            }

        }
    );

}


// ========================================
// KEYBOARD CLEAR SUPPORT
// ========================================

if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                questionInput.value.trim()
            ) {

                resetQuestionInput();

            }

        }
    );

}


// ========================================
// PART 8 STYLES
// ========================================

const part8Style =
    document.createElement("style");


part8Style.id =
    "holovision-part8-style";


part8Style.textContent = `

    .hv-welcome-screen {

        width: 100%;

        min-height: 220px;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;

        text-align: center;

        padding: 30px 20px;

    }


    .hv-welcome-avatar {

        width: 64px;

        height: 64px;

        border-radius: 50%;

        display: flex;

        align-items: center;

        justify-content: center;

        margin-bottom: 15px;

        font-family: Orbitron, sans-serif;

        font-weight: 700;

    }


    .hv-welcome-screen h2 {

        margin: 0 0 8px;

        font-family: Orbitron, sans-serif;

        font-size: 20px;

    }


    .hv-welcome-screen p {

        margin: 0;

        font-family: Poppins, sans-serif;

        font-size: 13px;

        opacity: 0.7;

    }


    @media (max-width: 600px) {

        .hv-welcome-screen {

            min-height: 180px;

            padding: 25px 15px;

        }


        .hv-welcome-screen h2 {

            font-size: 17px;

        }

    }

`;


if (
    !document.getElementById(
        "holovision-part8-style"
    )
) {

    document.head.appendChild(
        part8Style
    );

}


// ========================================
// PART 8 COMPLETE
// ========================================
// ========================================
// HOLOVISION AI - PART 9
// AI QUIZ — EXACTLY 10 QUESTIONS
// ========================================


// ========================================
// QUIZ CONSTANTS
// ========================================

const TOTAL_QUIZ_QUESTIONS = 10;
const QUIZ_TIME_SECONDS = 600;


// ========================================
// CREATE QUIZ BUTTON
// ========================================

function createQuizButton() {

    if (!questionInput) {
        return;
    }

    const inputRow =
        questionInput.closest(".input-row");

    if (!inputRow) {
        return;
    }

    if (
        document.getElementById("aiQuizBtn")
    ) {
        return;
    }

    const button =
        document.createElement("button");

    button.type = "button";
    button.id = "aiQuizBtn";
    button.className = "hv-quiz-button";

    button.innerHTML = `
        <i class="fas fa-brain"></i>
        AI Quiz
    `;

    button.addEventListener(
        "click",
        generateQuiz
    );

    inputRow.insertAdjacentElement(
        "afterend",
        button
    );
}


// ========================================
// QUIZ PROMPT
// ========================================

function buildQuizPrompt(topic) {

    return `
You are HoloVision AI Quiz Generator.

Create a quiz about:

"${topic}"

STRICT REQUIREMENTS:

- Generate EXACTLY 10 questions.
- Each question must have exactly 4 options.
- Each question must have exactly 1 correct answer.
- Questions must be educational and accurate.
- Questions must be suitable for a student.
- Avoid duplicate questions.
- Mix easy, medium and difficult questions.
- Do not use trick questions.
- The correctAnswer value MUST exactly match one of the four options.

Return ONLY valid JSON.

Use exactly this structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "Option A"
    }
  ]
}

There must be exactly 10 objects inside "questions".

Do not add Markdown.
Do not add explanations outside the JSON.
`.trim();
}


// ========================================
// CLEAN JSON RESPONSE
// ========================================

function cleanQuizResponse(text) {

    if (!text) {
        return "";
    }

    let cleaned =
        text.trim();

    cleaned =
        cleaned.replace(
            /^```json\s*/i,
            ""
        );

    cleaned =
        cleaned.replace(
            /^```\s*/i,
            ""
        );

    cleaned =
        cleaned.replace(
            /\s*```$/i,
            ""
        );

    return cleaned.trim();
}


// ========================================
// VALIDATE QUIZ
// ========================================

function validateQuizData(data) {

    if (!data) {
        return false;
    }

    if (
        !Array.isArray(data.questions)
    ) {
        return false;
    }

    if (
        data.questions.length !==
        TOTAL_QUIZ_QUESTIONS
    ) {
        return false;
    }

    for (
        let i = 0;
        i < data.questions.length;
        i++
    ) {

        const item =
            data.questions[i];

        if (
            !item ||
            typeof item.question !== "string" ||
            !item.question.trim()
        ) {
            return false;
        }

        if (
            !Array.isArray(item.options)
        ) {
            return false;
        }

        if (
            item.options.length !== 4
        ) {
            return false;
        }

        if (
            item.options.some(
                option =>
                    typeof option !== "string" ||
                    !option.trim()
            )
        ) {
            return false;
        }

        if (
            typeof item.correctAnswer !== "string"
        ) {
            return false;
        }

        if (
            !item.options.includes(
                item.correctAnswer
            )
        ) {
            return false;
        }
    }

    return true;
}


// ========================================
// GENERATE QUIZ
// ========================================

async function generateQuiz() {

    if (!questionInput) {
        return;
    }

    const topic =
        questionInput.value.trim();

    if (!topic) {

        questionInput.focus();

        questionInput.classList.add(
            "hv-input-error"
        );

        setTimeout(() => {

            questionInput.classList.remove(
                "hv-input-error"
            );

        }, 800);

        return;
    }


    if (!aiEnabled) {

        showAIError({
            message:
                "AI Assistant is disabled."
        });

        return;
    }


    if (!model) {

        showAIError({
            message:
                "Gemini model is unavailable."
        });

        return;
    }


    currentQuizTopic = topic;

    stopAISpeaking();

    questionInput.value = "";


    const quizLoading =
        addQuizLoading();


    const quizButton =
        document.getElementById(
            "aiQuizBtn"
        );


    if (quizButton) {
        quizButton.disabled = true;
    }


    try {

        const prompt =
            buildQuizPrompt(topic);


        const result =
            await model.generateContent(
                prompt
            );


        const response =
            result.response;


        const rawText =
            response.text();


        const cleaned =
            cleanQuizResponse(
                rawText
            );


        const firstBrace =
            cleaned.indexOf("{");


        const lastBrace =
            cleaned.lastIndexOf("}");


        if (
            firstBrace === -1 ||
            lastBrace === -1 ||
            lastBrace <= firstBrace
        ) {

            throw new Error(
                "Invalid AI quiz response."
            );

        }


        const jsonText =
            cleaned.slice(
                firstBrace,
                lastBrace + 1
            );


        const quizData =
            JSON.parse(jsonText);


        if (
            !validateQuizData(
                quizData
            )
        ) {

            throw new Error(
                "Invalid quiz format."
            );

        }


        removeQuizLoading(
            quizLoading
        );


        currentQuiz =
            quizData.questions;

        quizSubmitted = false;

        quizSeconds =
            QUIZ_TIME_SECONDS;


        displayQuiz(
            currentQuiz,
            topic
        );


    } catch (error) {

        removeQuizLoading(
            quizLoading
        );

        console.error(
            "HoloVision AI Quiz Error:",
            error
        );

        showAIError({
            message:
                "Quiz could not be generated. Please try again."
        });

    } finally {

        if (quizButton) {
            quizButton.disabled = false;
        }

    }
}


// ========================================
// QUIZ LOADING
// ========================================

function addQuizLoading() {

    if (!answerBox) {
        return null;
    }

    const loading =
        document.createElement("div");

    loading.className =
        "hv-chat-message hv-ai-message hv-quiz-loading";

    loading.innerHTML = `
        <div class="hv-avatar hv-ai-avatar">
            <span>HV</span>
        </div>

        <div class="hv-message-content">

            <div class="hv-bubble">

                <div class="hv-ai-name">
                    HOLOVISION AI · QUIZ
                </div>

                <div class="hv-thinking">

                    <span></span>
                    <span></span>
                    <span></span>

                    <em>
                        Preparing 10 questions...
                    </em>

                </div>

            </div>

        </div>
    `;

    answerBox.appendChild(
        loading
    );

    scrollChatToBottom();

    return loading;
}


// ========================================
// REMOVE QUIZ LOADING
// ========================================

function removeQuizLoading(
    loading
) {

    if (
        loading &&
        loading.parentNode
    ) {

        loading.remove();

    }
}


// ========================================
// DISPLAY QUIZ
// ========================================

function displayQuiz(
    quizData,
    topic
) {

    if (!answerBox) {
        return;
    }


    const oldQuiz =
        document.getElementById(
            "hvQuizContainer"
        );


    if (oldQuiz) {
        oldQuiz.remove();
    }


    const quizContainer =
        document.createElement("div");


    quizContainer.id =
        "hvQuizContainer";


    quizContainer.className =
        "hv-quiz-container";


    let html = `

        <div class="hv-quiz-header">

            <div>

                <div class="hv-quiz-title">
                    <i class="fas fa-brain"></i>
                    HOLOVISION AI QUIZ
                </div>

                <div class="hv-quiz-topic">
                    ${escapeHTML(topic)}
                </div>

            </div>

            <div
                id="quizTimer"
                class="hv-quiz-timer"
            >
                10:00
            </div>

        </div>

        <div class="hv-quiz-progress">
            10 Questions · 10 Minutes
        </div>

        <!-- START BUTTON ABOVE QUESTIONS -->

        <div class="hv-quiz-start-area">

            <button
                type="button"
                id="startQuizBtn"
                class="hv-start-quiz-btn"
            >
                <i class="fas fa-play"></i>
                Start Quiz
            </button>

        </div>

        <div class="hv-quiz-questions">
    `;


    quizData.forEach(
        (item, index) => {

            html += `

                <div
                    class="hv-quiz-question"
                    data-question="${index}"
                >

                    <div class="hv-question-number">
                        Question ${index + 1} of 10
                    </div>

                    <div class="hv-question-text">
                        ${escapeHTML(
                            item.question
                        )}
                    </div>

                    <div class="hv-options">
            `;


            item.options.forEach(
                (option, optionIndex) => {

                    const optionId =
                        `quiz_${index}_${optionIndex}`;


                    html += `

                        <label
                            class="hv-option"
                            for="${optionId}"
                        >

                            <input
                                type="radio"
                                id="${optionId}"
                                name="quiz_question_${index}"
                                value="${escapeHTML(
                                    option
                                )}"
                                disabled
                            >

                            <span class="hv-option-letter">
                                ${String.fromCharCode(
                                    65 + optionIndex
                                )}
                            </span>

                            <span class="hv-option-text">
                                ${escapeHTML(
                                    option
                                )}
                            </span>

                        </label>

                    `;

                }
            );


            html += `

                    </div>

                    <div
                        class="hv-question-feedback"
                        id="quizFeedback_${index}"
                    ></div>

                </div>

            `;

        }
    );


    html += `

        </div>

        <div class="hv-quiz-actions">

            <button
                type="button"
                id="submitQuizBtn"
                class="hv-submit-quiz-btn"
                disabled
            >
                <i class="fas fa-check"></i>
                Submit Quiz
            </button>

        </div>

        <div
            id="quizResult"
            class="hv-quiz-result"
        ></div>

    `;


    quizContainer.innerHTML =
        html;


    answerBox.appendChild(
        quizContainer
    );


    scrollChatToBottom();


    const startBtn =
        document.getElementById(
            "startQuizBtn"
        );


    const submitBtn =
        document.getElementById(
            "submitQuizBtn"
        );


    if (startBtn) {

        startBtn.addEventListener(
            "click",
            () => {

                startQuiz(
                    quizData
                );

            }
        );

    }


    if (submitBtn) {

        submitBtn.addEventListener(
            "click",
            () => {

                submitQuiz(
                    quizData,
                    topic,
                    false
                );

            }
        );

    }
}


// ========================================
// START QUIZ
// ========================================

function startQuiz(
    quizData
) {

    if (!quizData) {
        return;
    }


    if (quizSubmitted) {
        return;
    }


    const startBtn =
        document.getElementById(
            "startQuizBtn"
        );


    const submitBtn =
        document.getElementById(
            "submitQuizBtn"
        );


    const inputs =
        document.querySelectorAll(
            "#hvQuizContainer input[type='radio']"
        );


    // Enable all answers only after Start Quiz

    inputs.forEach(
        input => {

            input.disabled = false;

        }
    );


    if (startBtn) {

        startBtn.disabled = true;

        startBtn.innerHTML = `
            <i class="fas fa-check"></i>
            Quiz Started
        `;

    }


    if (submitBtn) {
        submitBtn.disabled = false;
    }


    // Timer starts ONLY here

    startQuizTimer();

    scrollChatToBottom();
}


// ========================================
// QUIZ TIMER
// ========================================

function startQuizTimer() {

    if (quizTimer) {

        clearInterval(
            quizTimer
        );

        quizTimer = null;

    }


    quizSeconds =
        QUIZ_TIME_SECONDS;


    updateQuizTimer();


    quizTimer =
        setInterval(
            () => {

                quizSeconds--;

                updateQuizTimer();


                if (
                    quizSeconds <= 0
                ) {

                    clearInterval(
                        quizTimer
                    );

                    quizTimer = null;


                    if (
                        currentQuiz &&
                        !quizSubmitted
                    ) {

                        submitQuiz(
                            currentQuiz,
                            currentQuizTopic,
                            true
                        );

                    }

                }

            },
            1000
        );
}


// ========================================
// UPDATE TIMER
// ========================================

function updateQuizTimer() {

    const timer =
        document.getElementById(
            "quizTimer"
        );


    if (!timer) {
        return;
    }


    const minutes =
        Math.floor(
            quizSeconds / 60
        );


    const seconds =
        quizSeconds % 60;


    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


// ========================================
// SUBMIT QUIZ
// ========================================

function submitQuiz(
    quizData,
    topic,
    timeUp = false
) {

    if (quizSubmitted) {
        return;
    }


    quizSubmitted = true;


    if (quizTimer) {

        clearInterval(
            quizTimer
        );

        quizTimer = null;

    }


    let score = 0;
    let answered = 0;


    const total =
        quizData.length;


    quizData.forEach(
        (item, index) => {

            const selected =
                document.querySelector(
                    `input[name="quiz_question_${index}"]:checked`
                );


            const feedback =
                document.getElementById(
                    `quizFeedback_${index}`
                );


            if (selected) {

                answered++;


                if (
                    selected.value ===
                    item.correctAnswer
                ) {

                    score++;


                    if (feedback) {

                        feedback.innerHTML = `
                            <div class="hv-correct-feedback">
                                <i class="fas fa-circle-check"></i>
                                Correct!
                            </div>
                        `;

                    }

                } else {

                    if (feedback) {

                        feedback.innerHTML = `
                            <div class="hv-wrong-feedback">

                                <div>
                                    <i class="fas fa-circle-xmark"></i>
                                    Wrong
                                </div>

                                <div class="hv-correct-answer">
                                    Correct answer:
                                    <strong>
                                        ${escapeHTML(
                                            item.correctAnswer
                                        )}
                                    </strong>
                                </div>

                            </div>
                        `;

                    }

                }

            } else {

                if (feedback) {

                    feedback.innerHTML = `
                        <div class="hv-unanswered-feedback">

                            <i class="fas fa-minus-circle"></i>
                            Not answered

                            <div class="hv-correct-answer">
                                Correct answer:
                                <strong>
                                    ${escapeHTML(
                                        item.correctAnswer
                                    )}
                                </strong>
                            </div>

                        </div>
                    `;

                }

            }

        }
    );


    const percentage =
        Math.round(
            (score / total) * 100
        );


    const resultBox =
        document.getElementById(
            "quizResult"
        );


    if (resultBox) {

        let message;


        if (percentage >= 80) {

            message =
                "Excellent work! Keep learning and exploring.";

        } else if (percentage >= 60) {

            message =
                "Good job! Review the missed points and try again.";

        } else {

            message =
                "Nice attempt! Keep practising—you can improve.";

        }


        resultBox.innerHTML = `

            <div class="hv-score-title">
                ${timeUp ? "TIME UP" : "QUIZ COMPLETE"}
            </div>

            <div class="hv-score">
                ${score} / ${total}
            </div>

            <div class="hv-score-percent">
                ${percentage}%
            </div>

            <div class="hv-score-details">
                Answered: ${answered} / ${total}
            </div>

            <div class="hv-score-message">
                ${message}
            </div>

            <div class="hv-motivational-quote">
                "Keep learning. Every attempt makes you stronger."
            </div>

            <button
                type="button"
                id="retryQuizBtn"
                class="hv-retry-quiz-btn"
            >
                <i class="fas fa-rotate-right"></i>
                Retry Quiz
            </button>

        `;


        const retryBtn =
            document.getElementById(
                "retryQuizBtn"
            );


        if (retryBtn) {

            retryBtn.addEventListener(
                "click",
                () => {

                    if (!questionInput) {
                        return;
                    }

                    questionInput.value =
                        currentQuizTopic || topic;

                    generateQuiz();

                }
            );

        }

    }


    // Disable all answers after submission

    const inputs =
        document.querySelectorAll(
            "#hvQuizContainer input[type='radio']"
        );


    inputs.forEach(
        input => {

            input.disabled = true;

        }
    );


    const submitBtn =
        document.getElementById(
            "submitQuizBtn"
        );


    if (submitBtn) {
        submitBtn.disabled = true;
    }


    const startBtn =
        document.getElementById(
            "startQuizBtn"
        );


    if (startBtn) {
        startBtn.disabled = true;
    }


    scrollChatToBottom();
}


// ========================================
// QUIZ STYLES
// ========================================

const part9Style =
    document.createElement("style");


part9Style.id =
    "holovision-part9-style";


part9Style.textContent = `

    .hv-quiz-button {

        margin-top: 10px;
        width: 100%;
        min-height: 42px;
        border-radius: 10px;
        cursor: pointer;
        font-family: Poppins, sans-serif;

    }


    .hv-quiz-container {

        width: 100%;
        margin-top: 16px;
        padding: 18px;
        border-radius: 14px;

    }


    .hv-quiz-header {

        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

    }


    .hv-quiz-title {

        font-family: Orbitron, sans-serif;
        font-weight: 700;
        font-size: 15px;

    }


    .hv-quiz-topic {

        margin-top: 5px;
        font-size: 12px;
        opacity: 0.7;

    }


    .hv-quiz-timer {

        font-family: Orbitron, sans-serif;
        font-weight: 700;
        white-space: nowrap;

    }


    .hv-quiz-progress {

        margin: 14px 0;
        font-size: 12px;
        opacity: 0.7;

    }


    .hv-quiz-start-area {

        margin: 10px 0 18px;
        width: 100%;

    }


    .hv-start-quiz-btn {

        width: 100%;
        min-height: 44px;
        border: 0;
        border-radius: 10px;
        cursor: pointer;
        font-family: Poppins, sans-serif;
        font-weight: 600;

    }


    .hv-quiz-question {

        padding: 15px 0;
        border-top: 1px solid rgba(
            255,
            255,
            255,
            0.08
        );

    }


    .hv-question-number {

        font-size: 11px;
        font-weight: 700;
        margin-bottom: 7px;
        opacity: 0.7;

    }


    .hv-question-text {

        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 10px;

    }


    .hv-options {

        display: grid;
        gap: 7px;

    }


    .hv-option {

        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;

    }


    .hv-option input {

        margin-top: 3px;
        flex-shrink: 0;

    }


    .hv-option-letter {

        min-width: 22px;
        font-weight: 700;
        opacity: 0.7;

    }


    .hv-option-text {

        line-height: 1.4;

    }


    .hv-question-feedback {

        margin-top: 8px;
        min-height: 0;
        font-size: 12px;
        line-height: 1.5;

    }


    .hv-correct-feedback {

        font-weight: 600;

    }


    .hv-wrong-feedback {

        font-weight: 600;

    }


    .hv-unanswered-feedback {

        font-weight: 600;

    }


    .hv-correct-answer {

        margin-top: 4px;
        font-size: 11px;
        opacity: 0.85;

    }


    .hv-quiz-actions {

        display: flex;
        gap: 8px;
        margin-top: 18px;

    }


    .hv-quiz-actions button,
    .hv-retry-quiz-btn {

        flex: 1;
        min-height: 42px;
        border: 0;
        border-radius: 9px;
        cursor: pointer;
        font-family: Poppins, sans-serif;

    }


    .hv-quiz-result {

        margin-top: 18px;
        padding-top: 16px;
        text-align: center;
        border-top: 1px solid rgba(
            255,
            255,
            255,
            0.08
        );

    }


    .hv-score-title {

        font-family: Orbitron, sans-serif;
        font-size: 13px;
        font-weight: 700;

    }


    .hv-score {

        margin-top: 8px;
        font-size: 28px;
        font-weight: 700;

    }


    .hv-score-percent {

        font-size: 16px;
        margin-top: 3px;

    }


    .hv-score-details {

        margin-top: 7px;
        font-size: 12px;
        opacity: 0.7;

    }


    .hv-score-message {

        margin: 12px 0 8px;
        font-size: 13px;
        line-height: 1.5;

    }


    .hv-motivational-quote {

        margin: 8px 0 14px;
        font-size: 12px;
        font-style: italic;
        opacity: 0.75;
        line-height: 1.5;

    }


    .hv-retry-quiz-btn {

        width: 100%;

    }


    @media (max-width: 600px) {

        .hv-quiz-container {

            padding: 14px;

        }


        .hv-quiz-header {

            align-items: flex-start;

        }


        .hv-quiz-title {

            font-size: 13px;

        }


        .hv-question-text {

            font-size: 13px;

        }


        .hv-quiz-actions {

            flex-direction: column;

        }

    }

`;

// ========================================
// ADD STYLE ONLY ONCE
// ========================================

if (
    !document.getElementById(
        "holovision-part9-style"
    )
) {

    document.head.appendChild(
        part9Style
    );

}


// ========================================
// INITIALIZE QUIZ BUTTON
// ========================================

createQuizButton();


// ========================================
// PART 9 COMPLETE
// ========================================
// ========================================
// HOLOVISION AI - PART 10
// 3D LEARNING LAB NAVIGATION
// TOP BUTTON ONLY
// ========================================

console.log("HoloVision AI - Part 10 Loaded");


// ========================================
// GET CURRENT TOPIC
// ========================================

function getCurrentTopicFor3DLab() {

    let topic = "";

    try {

        // Get topic from question input
        if (
            typeof questionInput !== "undefined" &&
            questionInput
        ) {
            topic = questionInput.value.trim();
        }

        // If input is empty, get latest user message
        if (!topic) {

            const answerBox =
                document.getElementById("answerBox");

            if (answerBox) {

                const userMessages =
                    answerBox.querySelectorAll(
                        ".hv-user-message"
                    );

                if (userMessages.length > 0) {

                    const lastUserMessage =
                        userMessages[
                            userMessages.length - 1
                        ];

                    topic =
                        lastUserMessage.textContent
                            .replace(
                                /^You\s*/i,
                                ""
                            )
                            .trim();
                }
            }
        }

    } catch (error) {

        console.log(
            "Topic detection skipped:",
            error
        );
    }

    topic = topic
        .replace(/\s+/g, " ")
        .trim();

    return topic;
}


// ========================================
// OPEN 3D LEARNING LAB
// WITH OR WITHOUT TOPIC
// ========================================

function open3DLab(topic = "") {

    let selectedTopic = "";

    // Use supplied topic
    if (
        typeof topic === "string" &&
        topic.trim()
    ) {

        selectedTopic =
            topic.trim();

    } else {

        // Automatically detect topic
        selectedTopic =
            getCurrentTopicFor3DLab();

    }


    // ------------------------------------
    // TOPIC AVAILABLE
    // ------------------------------------

    if (selectedTopic) {

        console.log(
            "Opening 3D Lab with topic:",
            selectedTopic
        );

        window.location.href =
            "3d.html?topic=" +
            encodeURIComponent(
                selectedTopic
            );

        return;
    }


    // ------------------------------------
    // NO TOPIC
    // ------------------------------------

    console.log(
        "Opening 3D Lab without topic"
    );

    window.location.href =
        "3d.html";
}


// ========================================
// CONNECT TOP 3D LEARNING LAB BUTTON
// ========================================

function connectTop3DLabButton() {

    const elements =
        document.querySelectorAll(
            "button, a, [role='button']"
        );


    elements.forEach(function (element) {

        const text =
            (
                element.textContent || ""
            )
            .trim()
            .toLowerCase();


        // Find top 3D Learning Lab button
        if (
            text.includes(
                "3d learning lab"
            ) ||
            text === "3d lab"
        ) {

            // Prevent duplicate connection
            if (
                element.dataset
                    .hv3dConnected === "true"
            ) {
                return;
            }


            element.dataset
                .hv3dConnected = "true";


            element.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();


                    console.log(
                        "3D Learning Lab button clicked"
                    );


                    // Detect current topic
                    const topic =
                        getCurrentTopicFor3DLab();


                    // Open with or without topic
                    open3DLab(topic);

                },
                true
            );
        }

    });
}


// ========================================
// REMOVE OLD BOTTOM / FLOATING BUTTONS
// ========================================

function removeOld3DLabButtons() {

    const selectors = [

        "#hvBottom3DLab",

        ".hv-bottom-3d-lab",

        ".hv-fixed-3d-lab",

        ".hv-floating-3d-lab",

        ".hv-bottom-3d-button"

    ];


    selectors.forEach(function (selector) {

        document
            .querySelectorAll(selector)
            .forEach(function (element) {

                element.remove();

            });

    });


    // Remove old styles if they exist
    const oldStyles = [

        "hv3dLabButtonStyle",

        "hvBottom3DLabStyle"

    ];


    oldStyles.forEach(function (id) {

        const style =
            document.getElementById(id);

        if (style) {
            style.remove();
        }

    });

}


// ========================================
// INLINE AI ANSWER 3D BUTTON
// ========================================
// This is NOT a bottom button.
// It appears only if another part
// explicitly calls this function.

function add3DLabButtonToAnswer(
    topic = ""
) {

    const answerBox =
        document.getElementById(
            "answerBox"
        );

    if (!answerBox) {
        return;
    }


    // Remove previous inline button
    answerBox
        .querySelectorAll(
            ".hv-inline-3d-lab"
        )
        .forEach(function (button) {

            button.remove();

        });


    const button =
        document.createElement("button");


    button.type =
        "button";


    button.className =
        "hv-inline-3d-lab";


    button.innerHTML = `
        <span class="hv-inline-3d-icon">
            ◇
        </span>
        <span>
            3D Learning Lab
        </span>
    `;


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            open3DLab(topic);

        }
    );


    // Inline button style
    if (
        !document.getElementById(
            "hvInline3DLabStyle"
        )
    ) {

        const style =
            document.createElement("style");


        style.id =
            "hvInline3DLabStyle";


        style.textContent = `

            .hv-inline-3d-lab {

                display: flex;

                align-items: center;

                justify-content: center;

                gap: 9px;

                width: 100%;

                max-width: 250px;

                min-height: 44px;

                margin: 15px 0;

                padding: 9px 16px;

                border: 1px solid
                    rgba(0, 229, 255, 0.45);

                border-radius: 12px;

                background:
                    rgba(0, 229, 255, 0.08);

                color: #dffcff;

                font-family:
                    "Poppins",
                    sans-serif;

                font-size: 14px;

                font-weight: 600;

                cursor: pointer;

                transition:
                    all 0.2s ease;

            }


            .hv-inline-3d-lab:hover {

                background:
                    rgba(0, 229, 255, 0.15);

                border-color:
                    rgba(0, 229, 255, 0.9);

            }


            .hv-inline-3d-icon {

                color: #00e5ff;

                font-size: 18px;

            }

        `;


        document.head.appendChild(style);

    }


    answerBox.appendChild(button);
}


// ========================================
// INITIALIZE
// ========================================

function initialize3DLabNavigation() {

    console.log(
        "Initializing 3D Learning Lab navigation..."
    );


    // Remove any old bottom button
    removeOld3DLabButtons();


    // Connect ONLY the top navigation button
    connectTop3DLabButton();

}


// ========================================
// PAGE READY
// ========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize3DLabNavigation
    );

} else {

    initialize3DLabNavigation();

}


// ========================================
// EXTRA CHECK
// ========================================

setTimeout(
    initialize3DLabNavigation,
    500
);


setTimeout(
    initialize3DLabNavigation,
    1500
);


console.log(
    "HoloVision AI - Part 10 Ready"
);
// ========================================
// HOLOVISION AI - PART 11
// SETTINGS SYSTEM
// ========================================


// ========================================
// SETTINGS ELEMENTS
// ========================================

const hvSettingsOverlay =
    document.getElementById(
        "settingsOverlay"
    ) ||
    document.getElementById(
        "settingsPanel"
    );

const hvSettingsBtn =
    document.getElementById(
        "settingsBtn"
    ) ||
    document.getElementById(
        "settingsNavBtn"
    );

const hvSettingsClose =
    document.getElementById(
        "settingsClose"
    ) ||
    document.getElementById(
        "closeSettingsBtn"
    );

const hvAiToggle =
    document.getElementById(
        "aiToggle"
    );

const hvSpeechToggle =
    document.getElementById(
        "speechToggle"
    );

const hvEffectsToggle =
    document.getElementById(
        "effectsToggle"
    );

// ========================================
// SETTINGS STATE
// ========================================

let hvSettingsOpen = false;


// ========================================
// OPEN SETTINGS
// ========================================

function openSettings() {

    if (!hvSettingsOverlay) {
        return;
    }


    hvSettingsOpen = true;


    // Support both possible class systems
    hvSettingsOverlay.classList.add(
        "active"
    );

    hvSettingsOverlay.classList.add(
        "show"
    );


    hvSettingsOverlay.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "settings-open"
    );

}


// ========================================
// CLOSE SETTINGS
// ========================================

function closeSettings() {

    if (!hvSettingsOverlay) {
        return;
    }


    hvSettingsOpen = false;


    hvSettingsOverlay.classList.remove(
        "active"
    );

    hvSettingsOverlay.classList.remove(
        "show"
    );


    hvSettingsOverlay.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "settings-open"
    );

}


// ========================================
// TOGGLE SETTINGS
// ========================================

function toggleSettings() {

    if (hvSettingsOpen) {

        closeSettings();

    } else {

        openSettings();

    }

}


// ========================================
// SETTINGS BUTTON
// ========================================

if (hvSettingsBtn) {

    hvSettingsBtn.addEventListener(
        "click",
        toggleSettings
    );

}


// ========================================
// SETTINGS CLOSE BUTTON
// ========================================

if (hvSettingsClose) {

    hvSettingsClose.addEventListener(
        "click",
        closeSettings
    );

}


// ========================================
// CLICK OUTSIDE SETTINGS
// ========================================

if (hvSettingsOverlay) {

    hvSettingsOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                hvSettingsOverlay
            ) {

                closeSettings();

            }

        }
    );

}


// ========================================
// ESCAPE → CLOSE SETTINGS
// ========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            hvSettingsOpen
        ) {

            closeSettings();

        }

    }
);


// ========================================
// AI TOGGLE
// ========================================

function updateAIToggle() {

    if (!hvAiToggle) {
        return;
    }


    hvAiToggle.checked =
        aiEnabled;


    hvAiToggle.setAttribute(
        "aria-checked",
        String(aiEnabled)
    );

}


// ========================================
// AI TOGGLE EVENT
// ========================================

if (hvAiToggle) {

    hvAiToggle.addEventListener(
        "change",
        () => {

            aiEnabled =
                hvAiToggle.checked;


            if (!aiEnabled) {

                stopAISpeaking();

                stopSpeaking();

                if (
                    typeof stopVoiceInput ===
                    "function"
                ) {

                    stopVoiceInput();

                }

            }


            updateAIToggle();

        }
    );

}


// ========================================
// SPEECH TOGGLE
// ========================================

function updateSpeechToggle() {

    if (!hvSpeechToggle) {
        return;
    }


    hvSpeechToggle.checked =
        speechEnabled;


    hvSpeechToggle.setAttribute(
        "aria-checked",
        String(speechEnabled)
    );

}


// ========================================
// SPEECH TOGGLE EVENT
// ========================================

if (hvSpeechToggle) {

    hvSpeechToggle.addEventListener(
        "change",
        () => {

            speechEnabled =
                hvSpeechToggle.checked;


            if (!speechEnabled) {

                stopAISpeaking();

            }


            updateSpeechToggle();

        }
    );

}


// ========================================
// EFFECTS TOGGLE
// ========================================

function updateEffectsToggle() {

    if (!hvEffectsToggle) {
        return;
    }


    hvEffectsToggle.checked =
        effectsEnabled;


    hvEffectsToggle.setAttribute(
        "aria-checked",
        String(effectsEnabled)
    );


    document.body.classList.toggle(
        "no-effects",
        !effectsEnabled
    );

}


// ========================================
// EFFECTS TOGGLE EVENT
// ========================================

if (hvEffectsToggle) {

    hvEffectsToggle.addEventListener(
        "change",
        () => {

            effectsEnabled =
                hvEffectsToggle.checked;


            updateEffectsToggle();

        }
    );

}


// ========================================
// SAVE SETTINGS
// ========================================

function saveHVSettings() {

    try {

        localStorage.setItem(
            "hv_ai_enabled",
            String(aiEnabled)
        );

        localStorage.setItem(
            "hv_speech_enabled",
            String(speechEnabled)
        );

        localStorage.setItem(
            "hv_effects_enabled",
            String(effectsEnabled)
        );

    } catch (error) {

        console.warn(
            "HoloVision settings could not be saved.",
            error
        );

    }

}


// ========================================
// LOAD SETTINGS
// ========================================

function loadHVSettings() {

    try {

        const savedAI =
            localStorage.getItem(
                "hv_ai_enabled"
            );

        const savedSpeech =
            localStorage.getItem(
                "hv_speech_enabled"
            );

        const savedEffects =
            localStorage.getItem(
                "hv_effects_enabled"
            );


        // ========================================
// DEFAULT AI = ON
// ========================================

aiEnabled = true;

if (hvAiToggle) {
    hvAiToggle.checked = true;
}


        if (
            savedSpeech !== null
        ) {

            speechEnabled =
                savedSpeech === "true";

        }


        if (
            savedEffects !== null
        ) {

            effectsEnabled =
                savedEffects === "true";

        }


    } catch (error) {

        console.warn(
            "HoloVision settings could not be loaded.",
            error
        );

    }


    updateAIToggle();

    updateSpeechToggle();

    updateEffectsToggle();

}


// ========================================
// AUTO-SAVE SETTINGS
// ========================================

if (hvAiToggle) {

    hvAiToggle.addEventListener(
        "change",
        saveHVSettings
    );

}

if (hvSpeechToggle) {

    hvSpeechToggle.addEventListener(
        "change",
        saveHVSettings
    );

}

if (hvEffectsToggle) {

    hvEffectsToggle.addEventListener(
        "change",
        saveHVSettings
    );

}


// ========================================
// SETTINGS OVERLAY CSS FIX
// ========================================

const part11Style =
    document.createElement("style");


part11Style.id =
    "holovision-part11-style";


part11Style.textContent = `

    /* Support both .show and .active */

    .settings-overlay.active,
    .settings-overlay.show {

        display: flex !important;

        visibility: visible !important;

        opacity: 1 !important;

    }


    .settings-overlay {

        transition:
            opacity 0.2s ease,
            visibility 0.2s ease;

    }


    /* Prevent background scrolling */

    body.settings-open {

        overflow: hidden;

    }


    /* Disabled AI visual state */

    body.hv-ai-disabled
    .hv-ai-message {

        opacity: 0.75;

    }


    /* Effects disabled */

    body.no-effects *,
    body.no-effects *::before,
    body.no-effects *::after {

        animation: none !important;

        transition: none !important;

    }


    @media (max-width: 600px) {

        .settings-overlay {

            padding: 12px;

        }

    }

`;

if (
    !document.getElementById(
        "holovision-part11-style"
    )
) {

    document.head.appendChild(
        part11Style
    );

}


// ========================================
// UPDATE AI BODY STATE
// ========================================

function updateAIBodyState() {

    document.body.classList.toggle(
        "hv-ai-disabled",
        !aiEnabled
    );

}


// ========================================
// INITIALIZE SETTINGS
// ========================================

loadHVSettings();

updateAIBodyState();


// ========================================
// KEEP BODY STATE UPDATED
// ========================================

if (hvAiToggle) {

    hvAiToggle.addEventListener(
        "change",
        updateAIBodyState
    );

}


// ========================================
// PART 11 COMPLETE
// ========================================
// ========================================
// HOLOVISION AI - PART 12
// RESPONSIVE + FINAL INTEGRATION
// ========================================


// ========================================
// FINAL SAFETY CHECK
// ========================================

(function () {

    "use strict";


    // ------------------------------------
    // REQUIRED ELEMENT CHECK
    // ------------------------------------

    const requiredElements = {

        question: questionInput,

        send: sendBtn,

        speak: speakBtn,

        voice: voiceBtn,

        study: studyBtn,

        clear: clearBtn,

        camera: cameraBtn,

        upload: uploadBtn,

        imageInput: imageInput,

        answerBox: answerBox

    };


    Object.entries(
        requiredElements
    ).forEach(
        ([name, element]) => {

            if (!element) {

                console.warn(
                    `HoloVision AI: ${name} element not found.`
                );

            }

        }
    );


    // ====================================
    // MOBILE VIEWPORT
    // ====================================

    function updateMobileState() {

        const isMobile =
            window.innerWidth <= 600;


        document.body.classList.toggle(
            "hv-mobile",
            isMobile
        );


        document.body.classList.toggle(
            "hv-desktop",
            !isMobile
        );

    }


    window.addEventListener(
        "resize",
        updateMobileState
    );


    updateMobileState();


    
    // ====================================
    // FINAL INPUT BEHAVIOUR
    // ====================================

    if (questionInput) {

        questionInput.setAttribute(
            "autocomplete",
            "off"
        );

        questionInput.setAttribute(
            "spellcheck",
            "true"
        );

    }


    // ====================================
    // FINAL SEND BUTTON
    // ====================================

    if (sendBtn) {

        sendBtn.type = "button";

        sendBtn.setAttribute(
            "aria-label",
            "Send question"
        );

    }


    // ====================================
    // FINAL VOICE BUTTON
    // ====================================

    if (voiceBtn) {

        voiceBtn.type = "button";

        voiceBtn.setAttribute(
            "aria-label",
            "Voice input"
        );

    }


    // ====================================
    // FINAL SPEAK BUTTON
    // ====================================

    if (speakBtn) {

        speakBtn.type = "button";

        speakBtn.setAttribute(
            "aria-label",
            "Read AI answer aloud"
        );

    }


    // ====================================
    // FINAL STUDY BUTTON
    // ====================================

    if (studyBtn) {

        studyBtn.type = "button";

        studyBtn.setAttribute(
            "aria-label",
            "Study mode"
        );

    }


    // ====================================
    // FINAL CLEAR BUTTON
    // ====================================

    if (clearBtn) {

        clearBtn.type = "button";

        clearBtn.setAttribute(
            "aria-label",
            "Clear chat"
        );

    }


    // ====================================
    // FINAL CAMERA BUTTON
    // ====================================

    if (cameraBtn) {

        cameraBtn.type = "button";

        cameraBtn.setAttribute(
            "aria-label",
            "Open camera"
        );

    }


    // ====================================
    // FINAL UPLOAD BUTTON
    // ====================================

    if (uploadBtn) {

        uploadBtn.type = "button";

        uploadBtn.setAttribute(
            "aria-label",
            "Upload image"
        );

    }


    // ====================================
    // IMAGE INPUT
    // ====================================

    if (imageInput) {

        imageInput.accept =
            "image/*";

    }


    // ====================================
    // FINAL CHAT SCROLL
    // ====================================

    function finalScrollToBottom() {

        if (!answerBox) {
            return;
        }


        requestAnimationFrame(
            () => {

                answerBox.scrollTop =
                    answerBox.scrollHeight;

            }
        );

    }


    window.hvScrollChat =
        finalScrollToBottom;


    // ====================================
    // IMAGE PREVIEW MOBILE FIX
    // ====================================

    function finalImagePreviewFix() {

        if (!imagePreview) {
            return;
        }


        const images =
            imagePreview.querySelectorAll(
                "img"
            );


        images.forEach(
            image => {

                image.style.maxWidth =
                    "100%";

                image.style.height =
                    "auto";

                image.style.display =
                    "block";

                image.style.objectFit =
                    "contain";

            }
        );

    }


    window.addEventListener(
        "resize",
        finalImagePreviewFix
    );


    finalImagePreviewFix();


    // ====================================
    // PREVENT DOUBLE QUIZ START
    // ====================================

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#startQuizBtn"
                );


            if (!button) {
                return;
            }


            if (
                button.dataset.clicked ===
                "true"
            ) {

                event.preventDefault();

                return;

            }


            button.dataset.clicked =
                "true";


            setTimeout(
                () => {

                    if (
                        button &&
                        button.isConnected
                    ) {

                        button.dataset.clicked =
                            "false";

                    }

                },
                1000
            );

        }
    );


    // ====================================
    // FINAL 3D BUTTON CHECK
    // ====================================

    if (
        !document.getElementById(
            "bottom3DLabBtn"
        )
    ) {

        if (
            typeof createBottom3DLabButton ===
            "function"
        ) {

            createBottom3DLabButton();

        }

    }


    

    // ====================================
    // FINAL SPEECH STATE
    // ====================================

    if (
        typeof updateSpeakButton ===
        "function"
    ) {

        updateSpeakButton();

    }


    // ====================================
    // FINAL VOICE STATE
    // ====================================

    if (
        typeof updateVoiceButton ===
        "function"
    ) {

        updateVoiceButton();

    }


    // ====================================
    // MOBILE KEYBOARD SUPPORT
    // ====================================

    if (questionInput) {

        questionInput.addEventListener(
            "focus",
            () => {

                setTimeout(
                    () => {

                        if (
                            document.activeElement ===
                            questionInput
                        ) {

                            questionInput.scrollIntoView(
                                {
                                    behavior:
                                        "smooth",

                                    block:
                                        "center"
                                }
                            );

                        }

                    },
                    250
                );

            }
        );

    }
    // ====================================
    // FINAL RESPONSIVE CSS
    // ====================================

    const finalStyle =
        document.createElement("style");


    finalStyle.id =
        "holovision-final-integration-style";


    finalStyle.textContent = `

        /* ================================
           GLOBAL RESPONSIVE SAFETY
           ================================ */

        html {

            width: 100%;

            max-width: 100%;

            overflow-x: hidden;

        }


        body {

            width: 100%;

            max-width: 100%;

            overflow-x: hidden;

        }


        button,
        input,
        textarea {

            max-width: 100%;

        }


        /* ================================
           CHAT SAFETY
           ================================ */

        .hv-chat-message {

            max-width: 100%;

            overflow-wrap: anywhere;

            word-break: break-word;

        }


        .hv-bubble {

            max-width: 100%;

            overflow-wrap: anywhere;

        }


        .hv-message-content {

            min-width: 0;

            max-width: 100%;

        }


        /* ================================
           AI ANSWER
           ================================ */

        .hv-ai-message {

            width: 100%;

        }


        .hv-ai-message pre {

            max-width: 100%;

            overflow-x: auto;

            white-space: pre-wrap;

            word-break: break-word;

        }


        .hv-ai-message code {

            max-width: 100%;

            word-break: break-word;

        }


        /* ================================
           IMAGE PREVIEW
           ================================ */

        #imagePreview {

            max-width: 100%;

            overflow: hidden;

        }


        #imagePreview img {

            max-width: 100% !important;

            height: auto !important;

        }


        /* ================================
           QUIZ
           ================================ */

        #hvQuizContainer {

            width: 100%;

            max-width: 100%;

            overflow: hidden;

        }


        .hv-option {

            min-width: 0;

            overflow-wrap: anywhere;

        }


        .hv-option-text {

            min-width: 0;

            word-break: break-word;

        }


        /* ================================
           MOBILE
           ================================ */

        @media (max-width: 600px) {

            body {

                padding-left: 0;

                padding-right: 0;

            }


            .hv-chat-message {

                width: 100%;

            }


            .hv-bubble {

                max-width: 92vw;

            }


            .hv-quiz-container {

                margin-left: 0;

                margin-right: 0;

            }


            .hv-quiz-header {

                flex-wrap: wrap;

            }


            .hv-quiz-timer {

                margin-left: auto;

            }


            .hv-inline-3d-lab-btn {

                width: 100%;

            }


            .hv-bottom-3d-lab {

                max-width: 90vw;

            }

        }


        /* ================================
           VERY SMALL PHONES
           ================================ */

        @media (max-width: 380px) {

            .hv-bubble {

                max-width: 88vw;

            }


            .hv-bottom-3d-lab {

                min-width: 125px;

                padding-left: 12px;

                padding-right: 12px;

            }


            .hv-quiz-container {

                padding-left: 10px;

                padding-right: 10px;

            }

        }


        /* ================================
           ACCESSIBILITY
           ================================ */

        button:disabled {

            cursor: not-allowed;

            opacity: 0.6;

        }


        button:focus-visible,
        input:focus-visible {

            outline:
                2px solid currentColor;

            outline-offset: 2px;

        }


        /* ================================
           PREVENT HORIZONTAL OVERFLOW
           ================================ */

        .chat-container,
        .chat-main,
        .chat-content,
        .messages-container {

            max-width: 100%;

            overflow-x: hidden;

        }

    `;


    if (
        !document.getElementById(
            "holovision-final-integration-style"
        )
    ) {

        document.head.appendChild(
            finalStyle
        );

    }


    // ====================================
    // FINAL INITIALIZATION
    // ====================================

    setTimeout(
        () => {

            updateMobileState();

            finalImagePreviewFix();

            finalScrollToBottom();

        },
        100
    );


    // ====================================
    // PROJECT STATUS
    // ====================================

    console.log(
        "HoloVision AI Chat — Final Integration Loaded Successfully."
    );

})();

    