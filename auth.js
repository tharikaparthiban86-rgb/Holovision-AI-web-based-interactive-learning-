import { auth } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";


// =========================
// SIGNUP
// =========================

window.signup = function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)

        .then(() => {

            alert("Account Created Successfully!");

            window.location.href = "https://YOUR-HOSTED-SITE/home.html";

        })

        .catch((error) => {

            alert(error.message);

        });
};


// =========================
// LOGIN
// =========================

window.login = function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)

        .then(() => {

            alert("Login Successful!");

            // IMPORTANT:
            // Change this only if your home file
            // has a different name.

            window.location = "./home.html";

        })

        .catch((error) => {

            alert(error.message);

        });
};


// =========================
// LOGOUT
// =========================

window.logout = function () {

    signOut(auth)

        .then(() => {

            alert("Logged Out Successfully!");

            window.location.href = "login.html";

        })

        .catch((error) => {

            alert(error.message);

        });
};