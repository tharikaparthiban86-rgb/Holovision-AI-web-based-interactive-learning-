/* ========================================
   HOLOVISION AI - FIREBASE AI CONFIG
   ======================================== */

import {
    getAI,
    getGenerativeModel,
    GoogleAIBackend
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-ai.js";

import { app } from "./firebase-config.js";


/* ========================================
   INITIALIZE FIREBASE AI
   ======================================== */

const ai = getAI(app, {
    backend: new GoogleAIBackend()
});


/* ========================================
   GEMINI MODEL
   ======================================== */

const model = getGenerativeModel(ai, {
    model: "gemini-3.8-flash"
});


/* ========================================
   EXPORT
   ======================================== */

export { model };