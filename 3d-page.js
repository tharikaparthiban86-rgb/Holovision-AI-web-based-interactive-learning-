// ========================================
// HOLOVISION AI - 3D PAGE JS
// PART 1 - GEMINI BRIDGE
// ========================================
// ========================================
// PART 1 - GEMINI BRIDGE
// ========================================

(function () {

  "use strict";

  // Gemini is provided directly by 3d.html
  // through Firebase AI model.

  function generateWithGemini(prompt, topic) {

    if (
      typeof window.HV_GEMINI_GENERATE ===
      "function"
    ) {

      return window.HV_GEMINI_GENERATE(
        prompt,
        topic
      );

    }

    console.warn(
      "HoloVision: Gemini bridge unavailable."
    );

    return Promise.resolve(null);
  }

  window.HV_3D_GEMINI =
    generateWithGemini;

})();
// ========================================
// PART 2 - SAFE RESPONSE HANDLER
// ========================================

function extractGeminiText(result) {

  if (!result) {
    return "";
  }

  if (typeof result === "string") {
    return result.trim();
  }

  if (result.text) {
    return String(result.text).trim();
  }

  if (result.answer) {
    return String(result.answer).trim();
  }

  if (result.response) {
    return String(result.response).trim();
  }

  if (result.output) {
    return String(result.output).trim();
  }

  // Firebase/Gemini response format
  try {

    const text =
      result?.candidates?.[0]
        ?.content?.parts?.[0]?.text;

    if (text) {
      return String(text).trim();
    }

  } catch (error) {

    console.warn(
      "HV response parsing warning:",
      error
    );

  }

  return "";
}


// ----------------------------------------
// Public helper
// ----------------------------------------

window.HV_GET_GEMINI_TEXT =
  extractGeminiText;
  
  // ========================================
// PART 3 - TOPIC NORMALIZATION
// ========================================

(function () {

  "use strict";

  function normalizeTopic(topic) {

    if (!topic) {
      return "";
    }

    return String(topic)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }


  function getTopicKey(topic) {

    const value = normalizeTopic(topic);

    if (!value) {
      return "";
    }

    if (
      window.TOPIC_ALIASES &&
      window.TOPIC_ALIASES[value]
    ) {
      return window.TOPIC_ALIASES[value];
    }

    if (
      window.TOPICS &&
      window.TOPICS[value]
    ) {
      return value;
    }

    return value;
  }


  window.HV_NORMALIZE_TOPIC =
    normalizeTopic;

  window.HV_GET_TOPIC_KEY =
    getTopicKey;

})();
// ========================================
// PART 4 - TOPIC DATA HELPERS
// ========================================

(function () {

  "use strict";

  function getTopicData(topic) {

    const key =
      typeof window.HV_GET_TOPIC_KEY === "function"
        ? window.HV_GET_TOPIC_KEY(topic)
        : String(topic || "")
            .trim()
            .toLowerCase();

    if (
      window.TOPICS &&
      window.TOPICS[key]
    ) {
      return window.TOPICS[key];
    }

    return {
      title: topic || "Learning Topic",
      model: "",
      parts: []
    };
  }


  function getModelPath(topic) {

    const data = getTopicData(topic);

    return data.model || "";
  }


  function getParts(topic) {

    const data = getTopicData(topic);

    return Array.isArray(data.parts)
      ? data.parts
      : [];
  }


  window.HV_GET_TOPIC_DATA =
    getTopicData;

  window.HV_GET_MODEL_PATH =
    getModelPath;

  window.HV_GET_PARTS =
    getParts;

})();
// ========================================
// PART 5 - VISUAL STATE HELPERS
// ========================================

(function () {

  "use strict";

  const state = {
    topic: "",
    mode: "3D",
    modelLoaded: false,
    imageLoaded: false,
    selectedPart: ""
  };


  function setVisualState(updates = {}) {

    Object.assign(state, updates);

    window.HV_VISUAL_STATE = state;

    return state;
  }


  function getVisualState() {

    return {
      ...state
    };
  }


  function clearVisualState() {

    state.topic = "";
    state.mode = "3D";
    state.modelLoaded = false;
    state.imageLoaded = false;
    state.selectedPart = "";

    window.HV_VISUAL_STATE = state;

    return state;
  }


  window.HV_SET_VISUAL_STATE =
    setVisualState;

  window.HV_GET_VISUAL_STATE =
    getVisualState;

  window.HV_CLEAR_VISUAL_STATE =
    clearVisualState;

})();
// ========================================
// PART 6 - STATUS & UI HELPERS
// ========================================

(function () {

  "use strict";

  function setStatus(message, type = "info") {

    const status =
      document.getElementById("visualStatus");

    if (!status) {
      return;
    }

    status.textContent =
      message || "";

    status.className =
      "visual-status " + type;
  }


  function clearStatus() {

    const status =
      document.getElementById("visualStatus");

    if (!status) {
      return;
    }

    status.textContent = "";
    status.className = "visual-status";
  }


  function setLoading(isLoading) {

    const buttons =
      document.querySelectorAll(
        "#visualiseBtn, #clearBtn"
      );

    buttons.forEach((button) => {

      if (!button) {
        return;
      }

      button.disabled = !!isLoading;

    });
  }


  window.HV_SET_STATUS =
    setStatus;

  window.HV_CLEAR_STATUS =
    clearStatus;

  window.HV_SET_LOADING =
    setLoading;

})();
// ========================================
// PART 7 - DOM ELEMENT HELPERS
// ========================================

(function () {

  "use strict";

  function getElement(id) {
    return document.getElementById(id);
  }

  function getTopicInput() {
    return (
      getElement("topicInput") ||
      getElement("topicSearch")
    );
  }

  function getVisualiseButton() {
    return (
      getElement("visualiseBtn") ||
      getElement("visualizeBtn")
    );
  }

  function getClearButton() {
    return getElement("clearBtn");
  }

  function getViewer() {
    return (
      getElement("viewer") ||
      getElement("viewerArea") ||
      getElement("visual3dArea")
    );
  }

  function getPartsContainer() {
    return (
      getElement("partsList") ||
      getElement("partsContainer")
    );
  }

  window.HV_DOM = {
    getElement,
    getTopicInput,
    getVisualiseButton,
    getClearButton,
    getViewer,
    getPartsContainer
  };

})();
// ========================================
// PART 8 - TOPIC INPUT & VISUALISE
// ========================================

(function () {

  "use strict";

  const input =
    document.getElementById("topicInput");

  const visualiseBtn =
    document.getElementById("visualiseBtn");


  async function visualiseTopic() {

    if (!input) {
      return;
    }

    const topic =
      input.value.trim();

    if (!topic) {

      if (typeof window.HV_SET_STATUS === "function") {
        window.HV_SET_STATUS(
          "Enter a topic to visualise.",
          "warning"
        );
      }

      return;
    }


    if (typeof window.HV_SET_LOADING === "function") {
      window.HV_SET_LOADING(true);
    }


    if (typeof window.HV_SET_STATUS === "function") {
      window.HV_SET_STATUS(
        "Preparing visual...",
        "info"
      );
    }


    if (typeof window.HV_SET_VISUAL_STATE === "function") {
      window.HV_SET_VISUAL_STATE({
        topic: topic,
        selectedPart: "",
        modelLoaded: false,
        imageLoaded: false
      });
    }


    try {

      /*
       * 3d.html already contains the actual
       * loadTopic() function.
       *
       * Call it instead of duplicating
       * Three.js / GLB loading code here.
       */

      if (typeof window.HoloVision?.loadTopic === "function") {

        await window.HoloVision.loadTopic(topic);

      } else if (typeof window.loadTopic === "function") {

        await window.loadTopic(topic);

      } else {

        throw new Error(
          "3D topic loader is not available."
        );

      }


      if (typeof window.HV_SET_STATUS === "function") {
        window.HV_SET_STATUS(
          "Visual ready.",
          "success"
        );
      }

    } catch (error) {

      console.error(
        "HoloVision visualise error:",
        error
      );

      if (typeof window.HV_SET_STATUS === "function") {
        window.HV_SET_STATUS(
          "Unable to load this topic.",
          "error"
        );
      }

    } finally {

      if (typeof window.HV_SET_LOADING === "function") {
        window.HV_SET_LOADING(false);
      }

    }
  }


  if (visualiseBtn) {

    visualiseBtn.addEventListener(
      "click",
      visualiseTopic
    );

  }


  if (input) {

    input.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          visualiseTopic();

        }

      }
    );

  }


  window.HV_VISUALISE_TOPIC =
    visualiseTopic;

})();
// ========================================
// PART 9 - CLEAR VISUAL
// ========================================

(function () {

  "use strict";

  const clearBtn =
    document.getElementById("clearBtn");


  async function clearVisual() {

    try {

      // Use existing 3D page clear function
      if (
        window.HoloVision &&
        typeof window.HoloVision.clearEverything === "function"
      ) {

        await window.HoloVision.clearEverything();

      } else if (
        typeof window.clearEverything === "function"
      ) {

        await window.clearEverything();

      }


      // Clear search box
      const input =
        document.getElementById("topicInput");

      if (input) {
        input.value = "";
      }


      // Reset our state
      if (
        typeof window.HV_CLEAR_VISUAL_STATE ===
        "function"
      ) {

        window.HV_CLEAR_VISUAL_STATE();

      }


      if (
        typeof window.HV_CLEAR_STATUS ===
        "function"
      ) {

        window.HV_CLEAR_STATUS();

      }

    } catch (error) {

      console.error(
        "HoloVision clear error:",
        error
      );

      if (
        typeof window.HV_SET_STATUS ===
        "function"
      ) {

        window.HV_SET_STATUS(
          "Unable to clear visual.",
          "error"
        );

      }

    }

  }


  if (clearBtn) {

    clearBtn.addEventListener(
      "click",
      clearVisual
    );

  }


  window.HV_CLEAR_VISUAL =
    clearVisual;

})();
// ========================================
// PART 10 - MODE BUTTONS
// ========================================

(function () {

  "use strict";

  const mode3DBtn =
    document.getElementById("mode3DBtn");

  const mode2DBtn =
    document.getElementById("mode2DBtn");


  function setMode(mode) {

    if (
      typeof window.HV_SET_VISUAL_STATE ===
      "function"
    ) {
      window.HV_SET_VISUAL_STATE({
        mode: mode
      });
    }

    // Use existing 3D page mode function
    if (typeof window.setMode === "function") {
      window.setMode(mode);
    }

    if (mode3DBtn) {
      mode3DBtn.classList.toggle(
        "active",
        mode === "3D"
      );
    }

    if (mode2DBtn) {
      mode2DBtn.classList.toggle(
        "active",
        mode === "2D"
      );
    }
  }


  if (mode3DBtn) {

    mode3DBtn.addEventListener(
      "click",
      function () {
        setMode("3D");
      }
    );

  }


  if (mode2DBtn) {

    mode2DBtn.addEventListener(
      "click",
      function () {
        setMode("2D");
      }
    );

  }


  window.HV_SET_MODE =
    setMode;

})();
// ========================================
// PART 11 - ROTATE / ZOOM / RESET
// 3D + 2D IMAGE CONTROLS
// ========================================

(function () {

  "use strict";

  let imageScale = 1;
  let imageRotation = 0;

  function getImageElement() {

    const container =
      document.getElementById("imageView");

    if (!container) {
      return null;
    }

    return container.querySelector("img");
  }


  function updateImageTransform() {

    const image = getImageElement();

    if (!image) {
      return;
    }

    image.style.transform =
      `scale(${imageScale}) rotate(${imageRotation}deg)`;

    image.style.transformOrigin =
      "center center";

    image.style.transition =
      "transform 0.25s ease";
  }


  function resetImageTransform() {

    imageScale = 1;
    imageRotation = 0;

    updateImageTransform();
  }


  const rotateBtn =
    document.getElementById("rotateBtn");

  const zoomInBtn =
    document.getElementById("zoomInBtn");

  const zoomOutBtn =
    document.getElementById("zoomOutBtn");

  const resetBtn =
    document.getElementById("resetBtn");


  if (rotateBtn) {

    rotateBtn.addEventListener("click", function () {

      const state =
        window.HV_GET_VISUAL_STATE
          ? window.HV_GET_VISUAL_STATE()
          : {};

      if (state.mode === "2D") {

        imageRotation += 90;

        updateImageTransform();

        return;
      }

      if (typeof window.setRotation === "function") {
        window.setRotation();
      }

    });

  }


  if (zoomInBtn) {

    zoomInBtn.addEventListener("click", function () {

      const state =
        window.HV_GET_VISUAL_STATE
          ? window.HV_GET_VISUAL_STATE()
          : {};

      if (state.mode === "2D") {

        imageScale =
          Math.min(imageScale + 0.2, 3);

        updateImageTransform();

        return;
      }

      if (typeof window.zoomCamera === "function") {
        window.zoomCamera(1);
      }

    });

  }


  if (zoomOutBtn) {

    zoomOutBtn.addEventListener("click", function () {

      const state =
        window.HV_GET_VISUAL_STATE
          ? window.HV_GET_VISUAL_STATE()
          : {};

      if (state.mode === "2D") {

        imageScale =
          Math.max(imageScale - 0.2, 0.5);

        updateImageTransform();

        return;
      }

      if (typeof window.zoomCamera === "function") {
        window.zoomCamera(-1);
      }

    });

  }


  if (resetBtn) {

    resetBtn.addEventListener("click", function () {

      const state =
        window.HV_GET_VISUAL_STATE
          ? window.HV_GET_VISUAL_STATE()
          : {};

      if (state.mode === "2D") {

        resetImageTransform();

        return;
      }

      if (typeof window.resetCamera === "function") {
        window.resetCamera();
      }

    });

  }


  window.HV_RESET_IMAGE =
    resetImageTransform;

})();
// ========================================
// PART 12 - PARTS PANEL
// ========================================

(function () {

  "use strict";

  const partsList =
    document.getElementById("partsList");


  function renderParts(topic) {

    if (!partsList) {
      return;
    }

    partsList.innerHTML = "";

    const parts =
      typeof window.HV_GET_PARTS === "function"
        ? window.HV_GET_PARTS(topic)
        : [];

    if (!parts.length) {

      partsList.innerHTML =
        '<div class="no-parts">No parts available</div>';

      return;
    }


    parts.forEach(function (part, index) {

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "part-btn";
      button.textContent = part;

      button.addEventListener(
        "click",
        function () {

          selectPart(part, index);

        }
      );

      partsList.appendChild(button);

    });

  }
// ========================================
    // PUBLIC PARTS RENDERER
    // ========================================

    window.HV_RENDER_PARTS = renderParts;

  }
  

  function selectPart(part) {

  if (!part) {
    return;
  }

  if (
    typeof window.HV_SET_VISUAL_STATE ===
    "function"
  ) {

    window.HV_SET_VISUAL_STATE({
      selectedPart: part
    });

  }

  // Use the main 3D page function
  if (
    window.HoloVision &&
    typeof window.HoloVision.locatePart ===
    "function"
  ) {

    window.HoloVision.locatePart(part);

    return;
  }

  console.warn(
    "HoloVision: locatePart unavailable."
  );

}
// ========================================
// PART 13 - TOPIC LOAD HANDLER
// ========================================

(function () {

  "use strict";

  async function loadTopicFromSearch(topic) {

    if (!topic) {
      return false;
    }

    const cleanTopic =
      typeof window.HV_NORMALIZE_TOPIC === "function"
        ? window.HV_NORMALIZE_TOPIC(topic)
        : String(topic).trim().toLowerCase();

    if (!cleanTopic) {
      return false;
    }

    try {

      if (typeof window.HV_SET_STATUS === "function") {
        window.HV_SET_STATUS(
          "Loading " + topic + "...",
          "info"
        );
      }

      if (typeof window.HV_SET_VISUAL_STATE === "function") {
        window.HV_SET_VISUAL_STATE({
          topic: topic,
          selectedPart: "",
          modelLoaded: false,
          imageLoaded: false
        });
      }

      // Use the existing loader from 3d.html.
      if (
        window.HoloVision &&
        typeof window.HoloVision.loadTopic === "function"
      ) {

        await window.HoloVision.loadTopic(topic);

      } else if (typeof window.loadTopic === "function") {

        await window.loadTopic(topic);

      } else {

        throw new Error(
          "Topic loader not found."
        );

      }

      // Update parts panel.
      if (typeof window.HV_RENDER_PARTS === "function") {
        window.HV_RENDER_PARTS(topic);
      }

      if (typeof window.HV_SET_VISUAL_STATE === "function") {
        window.HV_SET_VISUAL_STATE({
          topic: topic
        });
      }

      return true;

    } catch (error) {

      console.error(
        "HoloVision topic loading error:",
        error
      );

      if (typeof window.HV_SET_STATUS === "function") {
        window.HV_SET_STATUS(
          "Could not load this topic.",
          "error"
        );
      }

      return false;
    }
  }


  window.HV_LOAD_TOPIC =
    loadTopicFromSearch;

})();
// ========================================
// PART 14 - AI ASSISTANT
// ========================================

(function () {

  "use strict";

  const questionInput =
    document.getElementById("aiQuestion") ||
    document.getElementById("questionInput");

  const askBtn =
    document.getElementById("askAIBtn") ||
    document.getElementById("sendAI");

  const aiAnswer =
    document.getElementById("aiAnswer") ||
    document.getElementById("assistantAnswer");

  const clearAI =
    document.getElementById("clearAIBtn") ||
    document.getElementById("clearAI");


  function showAnswer(text) {

    if (!aiAnswer) {
      return;
    }

    aiAnswer.textContent =
      text || "HV Assistant is ready.";
  }


  async function askAssistant() {

    if (!questionInput) {
      return;
    }

    const question =
      questionInput.value.trim();

    if (!question) {
      showAnswer("HV: Please enter a question.");
      return;
    }


    const topic =
      typeof window.HV_GET_VISUAL_STATE === "function"
        ? window.HV_GET_VISUAL_STATE().topic
        : "";


    showAnswer("HV: Thinking...");


    try {

      if (
        typeof window.HV_GEMINI_GENERATE !==
        "function"
      ) {
        throw new Error(
          "Gemini connection is not available."
        );
      }


      const prompt =
        `You are HoloVision AI, an educational assistant.

Topic: ${topic || "General Learning"}

Student question:
${question}

Give a clear, accurate and concise educational answer.
Use simple language and short paragraphs.
Do not add unnecessary information.`;


      const result =
        await window.HV_GEMINI_GENERATE(
          prompt,
          topic || "General Learning"
        );


      const text =
        typeof window.HV_GET_GEMINI_TEXT === "function"
          ? window.HV_GET_GEMINI_TEXT(result)
          : String(result || "");


      if (!text) {
        throw new Error(
          "Empty Gemini response."
        );
      }


      showAnswer(
        "HV: " + text
      );

    } catch (error) {

      console.error(
        "HoloVision AI error:",
        error
      );

      showAnswer(
        "HV: AI response is currently unavailable. Please try again."
      );

    }

  }


  function clearAssistant() {

    if (questionInput) {
      questionInput.value = "";
    }

    showAnswer(
      "HV Assistant is ready."
    );

  }


  if (askBtn) {

    askBtn.addEventListener(
      "click",
      askAssistant
    );

  }


  if (questionInput) {

    questionInput.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();
          askAssistant();

        }

      }
    );

  }


  if (clearAI) {

    clearAI.addEventListener(
      "click",
      clearAssistant
    );

  }


  window.HV_ASK_ASSISTANT =
    askAssistant;

  window.HV_CLEAR_ASSISTANT =
    clearAssistant;

})();
// ========================================
// PART 15 - AI CLEAR + ANSWER DISPLAY
// ========================================

(function () {

  "use strict";

  const answerBox =
    document.getElementById("aiAnswer") ||
    document.getElementById("assistantAnswer");

  const clearBtn =
    document.getElementById("clearAIBtn") ||
    document.getElementById("clearAI");


  function clearAIAnswer() {

    if (answerBox) {

      answerBox.textContent =
        "HV Assistant is ready.";

    }

  }


  function displayAIAnswer(text) {

    if (!answerBox) {
      return;
    }

    const cleanText =
      String(text || "")
        .trim();

    answerBox.textContent =
      cleanText
        ? "HV: " + cleanText
        : "HV Assistant is ready.";

  }


  if (clearBtn) {

    clearBtn.addEventListener(
      "click",
      clearAIAnswer
    );

  }


  window.HV_CLEAR_AI_ANSWER =
    clearAIAnswer;

  window.HV_DISPLAY_AI_ANSWER =
    displayAIAnswer;

})();
// ========================================
// PART 16 - CHALLENGE ELEMENTS
// ========================================

(function () {

  "use strict";

  const challengeArea =
    document.getElementById("challengeArea");

  const challengeQuestion =
    document.getElementById("challengeQuestion");

  const challengeOptions =
    document.getElementById("challengeOptions");

  const challengeNextBtn =
    document.getElementById("challengeNextBtn");

  const challengeStartBtn =
    document.getElementById("challengeStartBtn");

  const challengeScore =
    document.getElementById("challengeScore");


  let questions = [];
  let currentIndex = 0;
  let score = 0;


  function resetChallengeState() {

    questions = [];
    currentIndex = 0;
    score = 0;

    if (challengeOptions) {
      challengeOptions.innerHTML = "";
    }

    if (challengeQuestion) {
      challengeQuestion.textContent =
        "Start the 10 Question Challenge.";
    }

    if (challengeScore) {
      challengeScore.textContent = "";
    }

  }


  function getChallengeState() {

    return {
      questions: questions,
      currentIndex: currentIndex,
      score: score
    };

  }


  window.HV_CHALLENGE_STATE =
    getChallengeState;

  window.HV_RESET_CHALLENGE =
    resetChallengeState;

})();
// ========================================
// PART 17 - GENERATE 10 CHALLENGE QUESTIONS
// ========================================

(function () {

  "use strict";

  async function generateChallengeQuestions() {

    const state =
      typeof window.HV_GET_VISUAL_STATE === "function"
        ? window.HV_GET_VISUAL_STATE()
        : {};

    const topic =
      state.topic || "General Science";


    if (typeof window.HV_SET_STATUS === "function") {
      window.HV_SET_STATUS(
        "Generating 10 challenge questions...",
        "info"
      );
    }


    const prompt = `
You are HoloVision AI.

Create exactly 10 educational multiple-choice questions
about this topic:

${topic}

Return ONLY valid JSON.

Format:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Short explanation"
  }
]

Rules:
- Exactly 10 questions
- Exactly 4 options per question
- "answer" must be 0, 1, 2, or 3
- Questions must be related to the topic
- Do not include markdown
`;


    try {

      if (
        typeof window.HV_GEMINI_GENERATE !==
        "function"
      ) {
        throw new Error(
          "Gemini connection is not available."
        );
      }


      const result =
        await window.HV_GEMINI_GENERATE(
          prompt,
          topic
        );


      const raw =
        typeof window.HV_GET_GEMINI_TEXT === "function"
          ? window.HV_GET_GEMINI_TEXT(result)
          : String(result || "");


      let jsonText =
        raw
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();


      const start =
        jsonText.indexOf("[");

      const end =
        jsonText.lastIndexOf("]");


      if (
        start === -1 ||
        end === -1
      ) {
        throw new Error(
          "Invalid challenge JSON."
        );
      }


      jsonText =
        jsonText.substring(
          start,
          end + 1
        );


      const generated =
        JSON.parse(jsonText);


      if (
        !Array.isArray(generated) ||
        generated.length !== 10
      ) {
        throw new Error(
          "Challenge must contain exactly 10 questions."
        );
      }


      const validQuestions =
        generated.map(function (item) {

          return {
            question:
              String(item.question || "").trim(),

            options:
              Array.isArray(item.options)
                ? item.options
                    .slice(0, 4)
                    .map(String)
                : [],

            answer:
              Number(item.answer),

            explanation:
              String(
                item.explanation || ""
              ).trim()
          };

        }).filter(function (item) {

          return (
            item.question &&
            item.options.length === 4 &&
            item.answer >= 0 &&
            item.answer <= 3
          );

        });


      if (validQuestions.length !== 10) {
        throw new Error(
          "Some generated questions are invalid."
        );
      }


      window.HV_CHALLENGE_QUESTIONS =
        validQuestions;

      window.HV_CHALLENGE_INDEX = 0;
      window.HV_CHALLENGE_SCORE = 0;


      if (
        typeof window.HV_SET_STATUS ===
        "function"
      ) {

        window.HV_SET_STATUS(
          "10 questions ready.",
          "success"
        );

      }


      return validQuestions;

    } catch (error) {

      console.error(
        "HoloVision Challenge generation error:",
        error
      );


      if (
        typeof window.HV_SET_STATUS ===
        "function"
      ) {

        window.HV_SET_STATUS(
          "Unable to generate challenge.",
          "error"
        );

      }


      return [];

    }

  }


  window.HV_GENERATE_CHALLENGE =
    generateChallengeQuestions;

})();
// ========================================
// PART 18 - RENDER CHALLENGE QUESTION
// ========================================

(function () {

  "use strict";

  function renderChallengeQuestion() {

    const questions =
      window.HV_CHALLENGE_QUESTIONS || [];

    const index =
      Number(window.HV_CHALLENGE_INDEX || 0);

    const questionBox =
      document.getElementById(
        "challengeQuestion"
      );

    const optionsBox =
      document.getElementById(
        "challengeOptions"
      );

    const scoreBox =
      document.getElementById(
        "challengeScore"
      );

    const nextBtn =
      document.getElementById(
        "challengeNextBtn"
      );


    if (!questionBox || !optionsBox) {
      return;
    }


    if (
      !questions.length ||
      index >= questions.length
    ) {

      questionBox.textContent =
        "Challenge completed.";

      optionsBox.innerHTML = "";

      if (nextBtn) {
        nextBtn.style.display = "none";
      }

      return;
    }


    const current =
      questions[index];


    questionBox.textContent =
      `${index + 1}. ${current.question}`;


    optionsBox.innerHTML = "";


    current.options.forEach(
      function (option, optionIndex) {

        const button =
          document.createElement("button");

        button.type = "button";
        button.className =
          "challenge-option";

        button.textContent =
          `${String.fromCharCode(65 + optionIndex)}. ${option}`;

        button.dataset.index =
          String(optionIndex);

        button.addEventListener(
          "click",
          function () {

            selectChallengeAnswer(
              optionIndex,
              button
            );

          }
        );

        optionsBox.appendChild(button);

      }
    );


    if (scoreBox) {

      scoreBox.textContent =
        `Score: ${Number(
          window.HV_CHALLENGE_SCORE || 0
        )}`;

    }


    if (nextBtn) {
      nextBtn.style.display = "none";
    }

  }


  function selectChallengeAnswer(
    selectedIndex,
    selectedButton
  ) {

    const questions =
      window.HV_CHALLENGE_QUESTIONS || [];

    const index =
      Number(window.HV_CHALLENGE_INDEX || 0);

    const current =
      questions[index];


    if (!current) {
      return;
    }


    const buttons =
      document.querySelectorAll(
        ".challenge-option"
      );


    buttons.forEach(
      function (button) {

        button.disabled = true;

      }
    );


    if (
      selectedIndex ===
      Number(current.answer)
    ) {

      window.HV_CHALLENGE_SCORE =
        Number(
          window.HV_CHALLENGE_SCORE || 0
        ) + 1;

      selectedButton.classList.add(
        "correct"
      );

    } else {

      selectedButton.classList.add(
        "wrong"
      );

      if (buttons[current.answer]) {
        buttons[current.answer]
          .classList.add("correct");
      }

    }


    const nextBtn =
      document.getElementById(
        "challengeNextBtn"
      );

    if (nextBtn) {
      nextBtn.style.display = "block";
    }


    const scoreBox =
      document.getElementById(
        "challengeScore"
      );

    if (scoreBox) {

      scoreBox.textContent =
        `Score: ${Number(
          window.HV_CHALLENGE_SCORE || 0
        )}`;

    }

  }


  window.HV_RENDER_CHALLENGE =
    renderChallengeQuestion;

  window.HV_SELECT_CHALLENGE_ANSWER =
    selectChallengeAnswer;

})();
// ========================================
// PART 19 - CHALLENGE START & NEXT
// ========================================

(function () {

  "use strict";

  const startBtn =
    document.getElementById("challengeStartBtn");

  const nextBtn =
    document.getElementById("challengeNextBtn");


  async function startChallenge() {

    if (startBtn) {
      startBtn.disabled = true;
    }

    try {

      window.HV_CHALLENGE_INDEX = 0;
      window.HV_CHALLENGE_SCORE = 0;

      const questions =
        await window.HV_GENERATE_CHALLENGE();

      if (!questions || questions.length !== 10) {
        return;
      }

      if (
        typeof window.HV_RENDER_CHALLENGE ===
        "function"
      ) {
        window.HV_RENDER_CHALLENGE();
      }

    } finally {

      if (startBtn) {
        startBtn.disabled = false;
      }

    }
  }


  function nextChallengeQuestion() {

    const questions =
      window.HV_CHALLENGE_QUESTIONS || [];

    const currentIndex =
      Number(window.HV_CHALLENGE_INDEX || 0);

    if (currentIndex >= questions.length - 1) {

      showChallengeResult();
      return;
    }

    window.HV_CHALLENGE_INDEX =
      currentIndex + 1;

    if (
      typeof window.HV_RENDER_CHALLENGE ===
      "function"
    ) {
      window.HV_RENDER_CHALLENGE();
    }

  }


  function showChallengeResult() {

    const score =
      Number(
        window.HV_CHALLENGE_SCORE || 0
      );

    const questionBox =
      document.getElementById(
        "challengeQuestion"
      );

    const optionsBox =
      document.getElementById(
        "challengeOptions"
      );

    const scoreBox =
      document.getElementById(
        "challengeScore"
      );


    if (questionBox) {

      questionBox.textContent =
        "Challenge Completed! 🎉";

    }


    if (optionsBox) {

      optionsBox.innerHTML =
        "<p>Great effort! Keep learning with HoloVision AI.</p>";

    }


    if (scoreBox) {

      scoreBox.textContent =
        `Final Score: ${score} / 10`;

    }


    if (nextBtn) {
      nextBtn.style.display = "none";
    }

  }


  if (startBtn) {

    startBtn.addEventListener(
      "click",
      startChallenge
    );

  }


  if (nextBtn) {

    nextBtn.addEventListener(
      "click",
      nextChallengeQuestion
    );

  }


  window.HV_START_CHALLENGE =
    startChallenge;

  window.HV_NEXT_CHALLENGE =
    nextChallengeQuestion;

})();
// ========================================
// PART 20 - CHALLENGE RESET / NEW SET
// ========================================

(function () {

  "use strict";

  const resetBtn =
    document.getElementById("challengeResetBtn") ||
    document.getElementById("newChallengeBtn");


  async function resetChallenge() {

    window.HV_CHALLENGE_QUESTIONS = [];
    window.HV_CHALLENGE_INDEX = 0;
    window.HV_CHALLENGE_SCORE = 0;


    const questionBox =
      document.getElementById("challengeQuestion");

    const optionsBox =
      document.getElementById("challengeOptions");

    const scoreBox =
      document.getElementById("challengeScore");

    const nextBtn =
      document.getElementById("challengeNextBtn");


    if (questionBox) {
      questionBox.textContent =
        "Generating a new challenge...";
    }

    if (optionsBox) {
      optionsBox.innerHTML = "";
    }

    if (scoreBox) {
      scoreBox.textContent = "";
    }

    if (nextBtn) {
      nextBtn.style.display = "none";
    }


    // Generate a fresh set from Gemini.
    if (
      typeof window.HV_GENERATE_CHALLENGE ===
      "function"
    ) {

      const questions =
        await window.HV_GENERATE_CHALLENGE();

      if (
        questions &&
        questions.length === 10 &&
        typeof window.HV_RENDER_CHALLENGE ===
          "function"
      ) {

        window.HV_RENDER_CHALLENGE();

      }

    }

  }


  if (resetBtn) {

    resetBtn.addEventListener(
      "click",
      resetChallenge
    );

  }


  window.HV_RESET_AND_NEW_CHALLENGE =
    resetChallenge;

})();
// ========================================
// PART 20A - CREATE CHALLENGE CLEAR BUTTON
// ========================================

(function () {

  "use strict";

  const challengeArea =
    document.getElementById("challengeArea");

  if (!challengeArea) {
    return;
  }


  // Create Clear button
  let clearBtn =
    document.getElementById("challengeClearBtn");


  if (!clearBtn) {

    clearBtn =
      document.createElement("button");

    clearBtn.id =
      "challengeClearBtn";

    clearBtn.type =
      "button";

    clearBtn.textContent =
      "Clear";

    clearBtn.className =
      "challenge-clear-btn";


    // Add button to challenge area
    challengeArea.appendChild(clearBtn);

  }


  // Clear function
  function clearChallenge() {

    window.HV_CHALLENGE_QUESTIONS = [];
    window.HV_CHALLENGE_INDEX = 0;
    window.HV_CHALLENGE_SCORE = 0;


    const questionBox =
      document.getElementById(
        "challengeQuestion"
      );

    const optionsBox =
      document.getElementById(
        "challengeOptions"
      );

    const scoreBox =
      document.getElementById(
        "challengeScore"
      );

    const nextBtn =
      document.getElementById(
        "challengeNextBtn"
      );


    if (questionBox) {

      questionBox.textContent =
        "Start the 10 Question Challenge.";

    }


    if (optionsBox) {

      optionsBox.innerHTML = "";

    }


    if (scoreBox) {

      scoreBox.textContent = "";

    }


    if (nextBtn) {

      nextBtn.style.display =
        "none";

    }


    if (
      typeof window.HV_RESET_CHALLENGE ===
      "function"
    ) {

      window.HV_RESET_CHALLENGE();

    }


    console.log(
      "HoloVision: Challenge cleared."
    );

  }


  clearBtn.addEventListener(
    "click",
    clearChallenge
  );


  window.HV_CLEAR_CHALLENGE =
    clearChallenge;

})();
// ========================================
// PART 21 - CHALLENGE MOTIVATION
// ========================================

(function () {

  "use strict";

  function getMotivation(score) {

    if (score === 10) {
      return "Excellent! Perfect score! 🌟";
    }

    if (score >= 8) {
      return "Great work! Keep learning! 🚀";
    }

    if (score >= 5) {
      return "Good effort! You are improving! 💡";
    }

    return "Keep practicing! You can do better next time! 📚";
  }


  function showMotivation(score) {

    const resultBox =
      document.getElementById(
        "challengeOptions"
      );

    if (!resultBox) {
      return;
    }

    const message =
      document.createElement("p");

    message.className =
      "challenge-motivation";

    message.textContent =
      getMotivation(score);

    resultBox.appendChild(message);

  }


  window.HV_GET_MOTIVATION =
    getMotivation;

  window.HV_SHOW_MOTIVATION =
    showMotivation;

})();
// ========================================
// PART 22 - CHALLENGE RESULT
// ========================================

(function () {

  "use strict";

  function finishChallenge() {

    const score =
      Number(window.HV_CHALLENGE_SCORE || 0);

    const questionBox =
      document.getElementById(
        "challengeQuestion"
      );

    const optionsBox =
      document.getElementById(
        "challengeOptions"
      );

    const scoreBox =
      document.getElementById(
        "challengeScore"
      );

    const nextBtn =
      document.getElementById(
        "challengeNextBtn"
      );


    if (questionBox) {
      questionBox.textContent =
        "Challenge Completed!";
    }


    if (scoreBox) {
      scoreBox.textContent =
        `Final Score: ${score} / 10`;
    }


    if (optionsBox) {
      optionsBox.innerHTML = "";
    }


    if (nextBtn) {
      nextBtn.style.display = "none";
    }


    if (
      typeof window.HV_SHOW_MOTIVATION ===
      "function"
    ) {

      window.HV_SHOW_MOTIVATION(score);

    }

  }


  window.HV_FINISH_CHALLENGE =
    finishChallenge;

})();
// ========================================
// PART 23 - SAFE GLOBAL EVENT BINDING
// ========================================

(function () {

  "use strict";

  function bindGlobalEvents() {

    const input =
      document.getElementById("topicInput");

    const visualiseBtn =
      document.getElementById("visualiseBtn");


    if (input && !input.dataset.hvBound) {

      input.dataset.hvBound = "true";

      input.addEventListener(
        "input",
        function () {

          const value =
            input.value.trim();

          if (
            typeof window.HV_SET_VISUAL_STATE ===
            "function"
          ) {

            window.HV_SET_VISUAL_STATE({
              topic: value,
              selectedPart: ""
            });

          }

        }
      );

    }


    if (
      visualiseBtn &&
      !visualiseBtn.dataset.hvBound
    ) {

      visualiseBtn.dataset.hvBound = "true";

      visualiseBtn.addEventListener(
        "click",
        function () {

          if (
            typeof window.HV_VISUALISE_TOPIC ===
            "function"
          ) {

            window.HV_VISUALISE_TOPIC();

          }

        }
      );

    }

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      bindGlobalEvents
    );

  } else {

    bindGlobalEvents();

  }


  window.HV_BIND_GLOBAL_EVENTS =
    bindGlobalEvents;

})();
// ========================================
// PART 24 - PAGE INITIALIZATION
// ========================================

(function () {

  "use strict";

  function initialize3DPage() {

    try {

      if (
        typeof window.HV_CLEAR_VISUAL_STATE ===
        "function"
      ) {
        window.HV_CLEAR_VISUAL_STATE();
      }


      const input =
        document.getElementById("topicInput");

      if (input) {
        input.value = "";
      }


      const parts =
        document.getElementById("partsList");

      if (parts) {
        parts.innerHTML =
          '<div class="no-parts">Select a topic to view parts.</div>';
      }


      const question =
        document.getElementById(
          "challengeQuestion"
        );

      if (question) {
        question.textContent =
          "Start the 10 Question Challenge.";
      }


      const options =
        document.getElementById(
          "challengeOptions"
        );

      if (options) {
        options.innerHTML = "";
      }


      const score =
        document.getElementById(
          "challengeScore"
        );

      if (score) {
        score.textContent = "";
      }


      if (
        typeof window.HV_SET_STATUS ===
        "function"
      ) {

        window.HV_SET_STATUS(
          "Enter a topic to begin.",
          "info"
        );

      }


      console.log(
        "HoloVision 3D Page initialized."
      );

    } catch (error) {

      console.error(
        "HoloVision initialization error:",
        error
      );

    }

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initialize3DPage
    );

  } else {

    initialize3DPage();

  }


  window.HV_INITIALIZE_3D_PAGE =
    initialize3DPage;

})();
// ========================================
// PART 25 - FINAL PUBLIC API
// ========================================

(function () {

  "use strict";

  window.HoloVision3D = {

    visualise:
      window.HV_VISUALISE_TOPIC || null,

    clear:
      window.HV_CLEAR_VISUAL || null,

    setMode:
      window.HV_SET_MODE || null,

    rotate:
      window.HV_ROTATE_VISUAL || null,

    zoomIn:
      window.HV_ZOOM_IN || null,

    zoomOut:
      window.HV_ZOOM_OUT || null,

    reset:
      window.HV_RESET_VISUAL || null,

    askAI:
      window.HV_ASK_ASSISTANT || null,

    clearAI:
      window.HV_CLEAR_ASSISTANT || null,

    startChallenge:
      window.HV_START_CHALLENGE || null,

    newChallenge:
      window.HV_RESET_AND_NEW_CHALLENGE || null

  };


  console.log(
    "HoloVision AI 3D Page JS loaded successfully."
  );

})();