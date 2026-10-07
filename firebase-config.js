// ========================================
// HOLOVISION AI - FIREBASE CONFIG
// TEXT AI + IMAGE AI
// GitHub Pages Safe Version
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

let ai = null;
let model = null;
let imageModel = null;


// ========================================
// INITIALIZE AI SAFELY
// ========================================

try {

    ai = getAI(app, {
        backend: new GoogleAIBackend()
    });

    console.log("HoloVision Firebase AI connected.");

} catch (error) {

    console.error(
        "Firebase AI initialization failed:",
        error
    );

}


// ========================================
// TEXT AI
// ========================================

try {

    if (ai) {

        model = getGenerativeModel(ai, {
            model: "gemini-3.8-flash"
        });

        console.log(
            "HoloVision Text AI READY."
        );

    }

} catch (error) {

    console.error(
        "Text AI initialization failed:",
        error
    );

}


// ========================================
// IMAGE AI
// ========================================

try {

    if (ai) {

        imageModel = getGenerativeModel(ai, {

            model: "gemini-3.1-flash-image",

            generationConfig: {

                responseModalities: [
                    ResponseModality.IMAGE
                ]

            }

        });

        console.log(
            "HoloVision Image AI READY."
        );

    }

} catch (error) {

    console.error(
        "Image AI initialization failed:",
        error
    );

}


// ========================================
// EXPORTS
// ========================================

export {
    app,
    ai,
    model,
    imageModel
};


// ========================================
// FINAL STATUS
// ========================================

console.log(
    "HoloVision Firebase initialized."
);

console.log(
    "HoloVision Firebase Auth initialized."
);

console.log(
    "HoloVision AI configuration loaded."
);
