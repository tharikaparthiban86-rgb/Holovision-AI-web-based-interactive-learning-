// ========================================
// HOLOVISION AI - FIREBASE CONFIG
// TEXT AI + IMAGE AI
// ========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getAI,
    getGenerativeModel,
    GoogleAIBackend,
    ResponseModality
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-ai.js";


// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyAh-zY2lZIOMaTYEwAGkGfgRXrkwLXvmm4",
    authDomain: "holovision-ai.firebaseapp.com",
    projectId: "holovision-ai",
    storageBucket: "holovision-ai.firebasestorage.app",
    messagingSenderId: "1021963543399",
    appId: "1:1021963543399:web:cb1f2a407d26d8ad2545c2"
};


// ========================================
// FIREBASE APP
// ========================================

const app = initializeApp(firebaseConfig);


// ========================================
// FIREBASE AUTH
// ========================================

export const auth = getAuth(app);


// ========================================
// FIREBASE AI
// ========================================

const ai = getAI(
    app,
    {
        backend: new GoogleAIBackend()
    }
);


// ========================================
// HOLOVISION TEXT AI
// ========================================
// Main educational / chat / explanation model

export const model = getGenerativeModel(
    ai,
    {
        model: "gemini-3.8-flash"
    }
);


// ========================================
// HOLOVISION IMAGE AI
// ========================================
// Dedicated Gemini image-generation model

export const imageModel = getGenerativeModel(
    ai,
    {
        model: "gemini-3.1-flash-image",

        generationConfig: {
            responseModalities: [
                ResponseModality.IMAGE
            ]
        }
    }
);


// ========================================
// EXPORTS
// ========================================

export {
    app,
    ai
};


// ========================================
// DEBUG
// ========================================

console.log(
    "HoloVision Firebase initialized successfully."
);

console.log(
    "HoloVision Firebase Auth initialized."
);

console.log(
    "HoloVision Text AI initialized."
);

console.log(
    "HoloVision Text Model: gemini-3.8-flash"
);

console.log(
    "HoloVision Image AI initialized."
);

console.log(
    "HoloVision Image Model: gemini-3.1-flash-image"
);

console.log(
    "HoloVision AI system READY."
);