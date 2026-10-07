/* =========================================================
   HOLOVISION AI - 3D LAB
   GitHub Pages Safe Controller
   ========================================================= */

(function () {
  "use strict";

  console.log("HoloVision 3D Page JS starting...");

  /* =========================================================
     CONFIG
     ========================================================= */

  const MODEL_BASE = "./models/";

  const TOPICS = {
    heart: {
      name: "Heart",
      model: "heart.glb",
      aliases: ["heart", "cardiac", "human heart"],
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Diagram_of_the_human_heart_%28cropped%29.svg/640px-Diagram_of_the_human_heart_%28cropped%29.svg.png",
      parts: [
        "Right Atrium",
        "Left Atrium",
        "Right Ventricle",
        "Left Ventricle",
        "Aorta",
        "Pulmonary Artery",
        "Pulmonary Veins",
        "Septum"
      ]
    },

    brain: {
      name: "Brain",
      model: "Brain.glb",
      aliases: ["brain", "human brain"],
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Brain_diagram_without_numbers.svg/640px-Brain_diagram_without_numbers.svg.png",
      parts: [
        "Cerebrum",
        "Cerebellum",
        "Brain Stem",
        "Frontal Lobe",
        "Parietal Lobe",
        "Temporal Lobe",
        "Occipital Lobe"
      ]
    },

    lungs: {
      name: "Lungs",
      model: "Human lungs.glb",
      aliases: ["lungs", "lung", "human lungs"],
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Lungs_diagram_detailed.svg/640px-Lungs_diagram_detailed.svg.png",
      parts: [
        "Right Lung",
        "Left Lung",
        "Trachea",
        "Bronchi",
        "Bronchioles",
        "Alveoli",
        "Diaphragm"
      ]
    },

    kidney: {
      name: "Kidney",
      model: "kidney.glb",
      aliases: ["kidney", "human kidney"],
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Kidney_diagram.svg/640px-Kidney_diagram.svg.png",
      parts: [
        "Renal Cortex",
        "Renal Medulla",
        "Renal Pelvis",
        "Renal Artery",
        "Renal Vein",
        "Ureter"
      ]
    },

    skeleton: {
      name: "Human Skeleton",
      model: "human skeleton.glb",
      aliases: ["skeleton", "human skeleton", "bones"],
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Human_skeleton_front_en.svg/640px-Human_skeleton_front_en.svg.png",
      parts: [
        "Skull",
        "Spine",
        "Rib Cage",
        "Clavicle",
        "Humerus",
        "Pelvis",
        "Femur",
        "Tibia"
      ]
    },

    ear: {
      name: "Ear",
      model: "ear.glb",
      aliases: ["ear", "human ear"],
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Anatomy_of_the_Human_Ear.svg/640px-Anatomy_of_the_Human_Ear.svg.png",
      parts: [
        "Pinna",
        "Ear Canal",
        "Eardrum",
        "Malleus",
        "Incus",
        "Stapes",
        "Cochlea",
        "Semicircular Canals"
      ]
    }
  };

  /* =========================================================
     STATE
     ========================================================= */

  let currentTopic = null;
  let currentMode = "3d";

  let scene = null;
  let camera = null;
  let renderer = null;
  let controls = null;

  let currentModel = null;
  let animationFrame = null;

  let threeLoaded = false;
  let THREE = null;
  let GLTFLoader = null;
  let OrbitControls = null;

  /* =========================================================
     DOM HELPERS
     ========================================================= */

  function $(selectors) {
    if (!Array.isArray(selectors)) {
      selectors = [selectors];
    }

    for (const selector of selectors) {
      const element = document.querySelector(selector);

      if (element) {
        return element;
      }
    }

    return null;
  }

  function setStatus(message, type) {
    console.log("[HV STATUS]", message);

    if (typeof window.HV_SET_STATUS === "function") {
      try {
        window.HV_SET_STATUS(message, type || "info");
        return;
      } catch (e) {
        console.warn("HV_SET_STATUS failed:", e);
      }
    }

    const status = $([
      "#status",
      "#viewerStatus",
      ".viewer-status",
      ".status"
    ]);

    if (status) {
      status.textContent = message;
    }
  }

  /* =========================================================
     LOAD THREE.JS
     ========================================================= */

  async function loadThree() {

    if (threeLoaded) {
      return true;
    }

    try {

      const threeModule =
        await import(
          "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
        );

      const controlsModule =
        await import(
          "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"
        );

      const loaderModule =
        await import(
          "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js"
        );

      THREE = threeModule;
      OrbitControls = controlsModule.OrbitControls;
      GLTFLoader = loaderModule.GLTFLoader;

      threeLoaded = true;

      console.log("Three.js loaded successfully.");

      return true;

    } catch (error) {

      console.error("Three.js loading failed:", error);

      setStatus(
        "3D engine could not be loaded. Try refreshing the page.",
        "error"
      );

      return false;
    }
  }

  /* =========================================================
     FIND VIEWER
     ========================================================= */

  function getViewer() {

    return $([
      "#visual3dArea",
      "#viewer",
      "#threeViewer",
      "#modelViewer",
      ".visual3d-area",
      ".viewer-area",
      ".viewer"
    ]);
  }

  /* =========================================================
     CREATE 3D SCENE
     ========================================================= */

  async function createScene() {

    const viewer = getViewer();

    if (!viewer) {
      console.error("3D viewer element not found.");
      return false;
    }

    const loaded = await loadThree();

    if (!loaded) {
      return false;
    }

    if (renderer) {
      return true;
    }

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x020b14);

    camera = new THREE.PerspectiveCamera(
      45,
      Math.max(viewer.clientWidth, 300) /
        Math.max(viewer.clientHeight, 300),
      0.01,
      1000
    );

    camera.position.set(0, 0, 4);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(
      Math.max(viewer.clientWidth, 300),
      Math.max(viewer.clientHeight, 400)
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    viewer.innerHTML = "";
    viewer.appendChild(renderer.domElement);

    controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 0.3;
    controls.maxDistance = 30;

    /* LIGHTING */

    const ambient = new THREE.AmbientLight(
      0xffffff,
      2
    );

    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      3
    );

    keyLight.position.set(
      4,
      6,
      5
    );

    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      0x66ddff,
      2
    );

    fillLight.position.set(
      -4,
      2,
      4
    );

    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(
      0x8855ff,
      1.5
    );

    backLight.position.set(
      0,
      -3,
      -5
    );

    scene.add(backLight);

    /* ANIMATION */

    function animate() {

      animationFrame =
        requestAnimationFrame(animate);

      if (controls) {
        controls.update();
      }

      if (renderer && scene && camera) {
        renderer.render(
          scene,
          camera
        );
      }
    }

    animate();

    window.addEventListener(
      "resize",
      resizeViewer
    );

    return true;
  }

  /* =========================================================
     RESIZE
     ========================================================= */

  function resizeViewer() {

    if (!renderer || !camera) {
      return;
    }

    const viewer = getViewer();

    if (!viewer) {
      return;
    }

    const width =
      Math.max(viewer.clientWidth, 300);

    const height =
      Math.max(viewer.clientHeight, 400);

    camera.aspect =
      width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
      width,
      height
    );
  }

  /* =========================================================
     NORMALIZE TOPIC
     ========================================================= */

  function normalizeTopic(value) {

    const text =
      String(value || "")
        .trim()
        .toLowerCase();

    if (!text) {
      return null;
    }

    for (const key of Object.keys(TOPICS)) {

      const topic =
        TOPICS[key];

      if (
        key === text ||
        topic.aliases.some(
          alias =>
            text.includes(
              alias.toLowerCase()
            )
        )
      ) {
        return key;
      }
    }

    return null;
  }

  /* =========================================================
     GET TOPIC INPUT
     ========================================================= */

  function getTopicInput() {

    return $([
      "#topicInput",
      "#topic",
      "#searchTopic",
      "#searchInput",
      "#learningTopic",
      'input[placeholder*="topic" i]',
      'input[type="search"]'
    ]);
  }

  /* =========================================================
     REMOVE CURRENT MODEL
     ========================================================= */

  function removeCurrentModel() {

    if (!currentModel || !scene) {
      return;
    }

    scene.remove(currentModel);

    currentModel.traverse(
      function (object) {

        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {

          if (
            Array.isArray(
              object.material
            )
          ) {

            object.material.forEach(
              material => {
                if (
                  material.map
                ) {
                  material.map.dispose();
                }

                material.dispose();
              }
            );

          } else {

            if (
              object.material.map
            ) {
              object.material.map.dispose();
            }

            object.material.dispose();
          }
        }
      }
    );

    currentModel = null;
  }

  /* =========================================================
     CENTER MODEL
     ========================================================= */

  function centerModel(model) {

    const box =
      new THREE.Box3()
        .setFromObject(model);

    const center =
      box.getCenter(
        new THREE.Vector3()
      );

    const size =
      box.getSize(
        new THREE.Vector3()
      );

    model.position.sub(center);

    const maxDimension =
      Math.max(
        size.x,
        size.y,
        size.z
      );

    if (
      maxDimension > 0
    ) {

      const scale =
        2.5 / maxDimension;

      model.scale.setScalar(
        scale
      );
    }

    camera.position.set(
      0,
      0,
      4
    );

    controls.target.set(
      0,
      0,
      0
    );

    controls.update();
  }

  /* =========================================================
     LOAD GLB
     ========================================================= */

  async function loadModel(topicKey) {

    const topic =
      TOPICS[topicKey];

    if (!topic) {
      return false;
    }

    const ready =
      await createScene();

    if (!ready) {
      return false;
    }

    removeCurrentModel();

    setStatus(
      "Loading " +
        topic.name +
        " 3D model...",
      "info"
    );

    const loader =
      new GLTFLoader();

    const modelURL =
      MODEL_BASE +
      encodeURI(topic.model);

    return new Promise(
      function (resolve) {

        loader.load(

          modelURL,

          function (gltf) {

            currentModel =
              gltf.scene;

            currentModel.traverse(
              function (object) {

                if (
                  object.isMesh
                ) {

                  object.castShadow =
                    true;

                  object.receiveShadow =
                    true;

                  object.userData =
                    object.userData || {};

                  if (
                    object.material
                  ) {

                    object.material.side =
                      THREE.DoubleSide;
                  }
                }
              }
            );

            scene.add(
              currentModel
            );

            centerModel(
              currentModel
            );

            window.HV_CURRENT_MODEL =
              currentModel;

            setStatus(
              topic.name +
                " 3D model loaded.",
              "success"
            );

            updatePartsPanel(
              topic
            );

            resolve(true);
          },

          function () {

            setStatus(
              "Loading " +
                topic.name +
                "...",
              "info"
            );
          },

          function (error) {

            console.error(
              "GLB loading error:",
              error
            );

            removeCurrentModel();

            setStatus(
              "3D model unavailable. Educational image is ready.",
              "info"
            );

            showEducationalImage(
              topicKey
            );

            updatePartsPanel(
              topic
            );

            resolve(false);
          }
        );
      }
    );
  }

  /* =========================================================
     EDUCATIONAL IMAGE
     ========================================================= */

  function showEducationalImage(
    topicKey
  ) {

    const topic =
      TOPICS[topicKey];

    if (!topic) {
      return;
    }

    const viewer =
      getViewer();

    if (!viewer) {
      return;
    }

    currentMode =
      "image";

    viewer.innerHTML = "";

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.style.width =
      "100%";

    wrapper.style.height =
      "100%";

    wrapper.style.minHeight =
      "360px";

    wrapper.style.display =
      "flex";

    wrapper.style.flexDirection =
      "column";

    wrapper.style.alignItems =
      "center";

    wrapper.style.justifyContent =
      "center";

    wrapper.style.padding =
      "15px";

    const image =
      document.createElement(
        "img"
      );

    image.src =
      topic.image;

    image.alt =
      topic.name +
      " educational diagram";

    image.loading =
      "eager";

    image.style.maxWidth =
      "100%";

    image.style.maxHeight =
      "78%";

    image.style.objectFit =
      "contain";

    image.style.borderRadius =
      "12px";

    image.style.background =
      "#ffffff";

    const title =
      document.createElement(
        "div"
      );

    title.textContent =
      topic.name +
      " — Educational Visual";

    title.style.marginTop =
      "12px";

    title.style.fontSize =
      "16px";

    title.style.color =
      "#00e5ff";

    title.style.textAlign =
      "center";

    wrapper.appendChild(
      image
    );

    wrapper.appendChild(
      title
    );

    viewer.appendChild(
      wrapper
    );

    image.onerror =
      function () {

        title.textContent =
          "Educational visual unavailable.";
      };

    setStatus(
      "Educational image loaded.",
      "success"
    );
  }

  /* =========================================================
     PARTS PANEL
     ========================================================= */

  function getPartsContainer() {

    return $([
      "#partsList",
      "#partsPanel",
      "#partsContainer",
      ".parts-list",
      ".parts-panel"
    ]);
  }

  function updatePartsPanel(
    topic
  ) {

    const container =
      getPartsContainer();

    if (!container) {
      return;
    }

    container.innerHTML = "";

    const heading =
      document.createElement(
        "div"
      );

    heading.textContent =
      topic.name +
      " Parts";

    heading.style.color =
      "#00e5ff";

    heading.style.fontWeight =
      "700";

    heading.style.marginBottom =
      "10px";

    container.appendChild(
      heading
    );

    topic.parts.forEach(
      function (part, index) {

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.textContent =
          (index + 1) +
          ". " +
          part;

        button.dataset.part =
          part;

        button.style.width =
          "100%";

        button.style.textAlign =
          "left";

        button.style.margin =
          "4px 0";

        button.style.padding =
          "10px";

        button.style.borderRadius =
          "10px";

        button.style.cursor =
          "pointer";

        button.addEventListener(
          "click",
          function () {

            locatePart(
              part
            );
          }
        );

        container.appendChild(
          button
        );
      }
    );
  }

  /* =========================================================
     FIND PART MESH
     ========================================================= */

  function findPartMesh(
    partName
  ) {

    if (!currentModel) {
      return null;
    }

    const wanted =
      String(partName)
        .toLowerCase()
        .replace(
          /[^a-z0-9]/g,
          ""
        );

    let found = null;

    currentModel.traverse(
      function (object) {

        if (
          found ||
          !object.name
        ) {
          return;
        }

        const meshName =
          object.name
            .toLowerCase()
            .replace(
              /[^a-z0-9]/g,
              ""
            );

        if (
          meshName.includes(
            wanted
          ) ||
          wanted.includes(
            meshName
          )
        ) {
          found = object;
        }
      }
    );

    return found;
  }

  /* =========================================================
     LOCATE PART
     ========================================================= */

  function locatePart(
    partName
  ) {

    console.log(
      "Locating part:",
      partName
    );

    if (!currentModel) {

      setStatus(
        "Load the 3D model first.",
        "info"
      );

      return false;
    }

    const mesh =
      findPartMesh(
        partName
      );

    if (!mesh) {

      setStatus(
        partName +
          " could not be identified in this model.",
        "info"
      );

      return false;
    }

    const box =
      new THREE.Box3()
        .setFromObject(
          mesh
        );

    const center =
      box.getCenter(
        new THREE.Vector3()
      );

    const size =
      box.getSize(
        new THREE.Vector3()
      );

    controls.target.copy(
      center
  );

    const maxSize =
      Math.max(
        size.x,
        size.y,
        size.z,
        0.1
      );

    const distance =
      maxSize * 4;

    const direction =
      new THREE.Vector3(
        1,
        0.6,
        1
      )
        .normalize();

    camera.position.copy(
      center
    );

    camera.position.add(
      direction.multiplyScalar(
        distance
      )
    );

    controls.update();

    highlightMesh(
      mesh
    );

    setStatus(
      "Located: " +
        partName,
      "success"
    );

    return true;
  }

  /* =========================================================
     HIGHLIGHT PART
     ========================================================= */

  let highlightedMesh =
    null;

  let oldEmissive = null;

  function highlightMesh(
    mesh
  ) {

    if (
      highlightedMesh &&
      oldEmissive !== null
    ) {

      restoreMaterial(
        highlightedMesh,
        oldEmissive
      );
    }

    highlightedMesh =
      mesh;

    if (
      !mesh.material
    ) {
      return;
    }

    const material =
      Array.isArray(
        mesh.material
      )
        ? mesh.material[0]
        : mesh.material;

    if (
      material.emissive
    ) {

      oldEmissive =
        material.emissive.clone();

      material.emissive.set(
        0x00ffff
      );

      material.emissiveIntensity =
        1.5;
    }

    setTimeout(
      function () {

        if (
          highlightedMesh ===
          mesh
        ) {

          restoreMaterial(
            mesh,
            oldEmissive
          );

          highlightedMesh =
            null;

          oldEmissive =
            null;
        }

      },
      2500
    );
  }

  function restoreMaterial(
    mesh,
    emissive
  ) {

    if (
      !mesh ||
      !mesh.material ||
      !emissive
    ) {
      return;
    }

    const material =
      Array.isArray(
        mesh.material
      )
        ? mesh.material[0]
        : mesh.material;

    if (
      material.emissive
    ) {

      material.emissive.copy(
        emissive
      );
    }
  }

  /* =========================================================
     VISUALISE
     ========================================================= */

  async function visualiseTopic(
    value
  ) {

    const input =
      value ||
      (
        getTopicInput()
          ? getTopicInput().value
          : ""
      );

    const topicKey =
      normalizeTopic(
        input
      );

    if (!topicKey) {

      setStatus(
        "Enter a supported topic such as Heart, Brain, Lungs, Kidney, Skeleton or Ear.",
        "info"
      );

      return;
    }

    currentTopic =
      topicKey;

    currentMode =
      "3d";

    const inputElement =
      getTopicInput();

    if (inputElement) {
      inputElement.value =
        TOPICS[topicKey].name;
    }

    updatePartsPanel(
      TOPICS[topicKey]
    );

    const success =
      await loadModel(
        topicKey
      );

    if (!success) {

      showEducationalImage(
        topicKey
      );
    }

    window.HV_CURRENT_TOPIC =
      currentTopic;

    window.HV_CURRENT_MODEL =
      currentModel;

    return success;
}
  /* =========================================================
     CLEAR
     ========================================================= */

  function clearEverything() {

    removeCurrentModel();

    currentTopic =
      null;

    currentMode =
      "3d";

    const viewer =
      getViewer();

    if (viewer) {

      viewer.innerHTML = "";

      const message =
        document.createElement(
          "div"
        );

      message.style.height =
        "100%";

      message.style.minHeight =
        "360px";

      message.style.display =
        "flex";

      message.style.flexDirection =
        "column";

      message.style.alignItems =
        "center";

      message.style.justifyContent =
        "center";

      message.style.textAlign =
        "center";

      message.innerHTML =
        '<div style="font-size:24px;color:#00e5ff;font-weight:700;">Select a learning topic</div>' +
        '<div style="margin-top:12px;color:#8aa8b8;font-size:16px;">Search for a topic to load its 3D model or educational visual.</div>';

      viewer.appendChild(
        message
      );
    }

    const parts =
      getPartsContainer();

    if (parts) {
      parts.innerHTML = "";
    }

    const input =
      getTopicInput();

    if (input) {
      input.value = "";
    }

    setStatus(
      "Ready",
      "info"
    );

    window.HV_CURRENT_TOPIC =
      null;

    window.HV_CURRENT_MODEL =
      null;
  }

  /* =========================================================
     MODE
     ========================================================= */

  function setMode(
    mode
  ) {

    if (
      mode !== "3d" &&
      mode !== "image"
    ) {
      return;
    }

    currentMode =
      mode;

    if (!currentTopic) {
      return;
    }

    if (
      mode === "image"
    ) {

      showEducationalImage(
        currentTopic
      );

    } else {

      loadModel(
        currentTopic
      );
    }
  }

  /* =========================================================
     ROTATE
     ========================================================= */

  function rotateVisual() {

    if (!currentModel) {
      setStatus(
        "Load a 3D model first.",
        "info"
      );
      return;
    }

    currentModel.rotation.y +=
      Math.PI / 4;

    setStatus(
      "3D model rotated.",
      "success"
    );
  }

  /* =========================================================
     ZOOM
     ========================================================= */

  function zoomIn() {

    if (!camera || !controls) {
      return;
    }

    camera.position.multiplyScalar(
      0.8
    );

    controls.update();
  }

  function zoomOut() {

    if (!camera || !controls) {
      return;
    }

    camera.position.multiplyScalar(
      1.25
    );

    controls.update();
  }

  /* =========================================================
     RESET
     ========================================================= */

  function resetVisual() {

    if (!camera || !controls) {
      return;
    }

    camera.position.set(
      0,
      0,
      4
    );

    controls.target.set(
      0,
      0,
      0
    );

    if (currentModel) {
      currentModel.rotation.set(
        0,
        0,
        0
      );
    }

    controls.update();

    setStatus(
      "3D view reset.",
      "success"
    );
  }

  /* =========================================================
     FIND VISUAL
     ========================================================= */

  async function findVisual() {

    const input =
      getTopicInput();

    const value =
      input
        ? input.value
        : "";

    if (!value.trim()) {

      setStatus(
        "Enter a topic first.",
        "info"
      );

      return;
    }

    await visualiseTopic(
      value
    );
  }

  /* =========================================================
     AI ASSISTANT BRIDGE
     ========================================================= */

  async function askAssistant(
    question
  ) {

    const text =
      String(
        question || ""
      ).trim();

    if (!text) {
      return;
    }

    /* Existing AI function */

    if (
      typeof window.HV_GEMINI_GENERATE ===
      "function"
    ) {

      try {

        return await window.HV_GEMINI_GENERATE(
          text
        );

      } catch (error) {

        console.error(
          "Gemini assistant error:",
          error
        );
      }
    }

    if (
      typeof window.generate3DGemini ===
      "function"
    ) {

      try {

        return await window.generate3DGemini(
          text
        );

      } catch (error) {

        console.error(
          "AI generation error:",
          error
        );
      }
    }

    setStatus(
      "AI assistant connection is not available.",
      "info"
    );
  }

  /* =========================================================
     GLOBAL API
     ========================================================= */

  window.HV_VISUALISE_TOPIC =
    visualiseTopic;

  window.HV_CLEAR_VISUAL =
    clearEverything;

  window.HV_SET_MODE =
    setMode;

  window.HV_ROTATE_VISUAL =
    rotateVisual;

  window.HV_ZOOM_IN =
    zoomIn;

  window.HV_ZOOM_OUT =
    zoomOut;

  window.HV_RESET_VISUAL =
    resetVisual;

  window.HV_FIND_VISUAL =
    findVisual;

  window.HV_ASK_ASSISTANT =
    askAssistant;

  window.HV_GET_PARTS =
    function () {

      if (
        !currentTopic ||
        !TOPICS[currentTopic]
      ) {
        return [];
      }

      return TOPICS[
        currentTopic
      ].parts;
    };

  window.HV_LOCATE_PART =
    locatePart;

  window.HoloVision =
    window.HoloVision || {};

  window.HoloVision.loadTopic =
    visualiseTopic;

  window.HoloVision.clearEverything =
    clearEverything;

  window.HoloVision.locatePart =
    locatePart;

  /* =========================================================
     BUTTON CONNECTION
     ========================================================= */

  function connectButton(
    selectors,
    callback
  ) {

    const button =
      $(selectors);

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        try {
          callback(event);
        } catch (error) {
          console.error(
            "Button error:",
            error
          );
        }
      }
    );
  }

  function connectUI() {

    /* VISUALISE */

    connectButton(
      [
        "#visualiseBtn",
        "#visualizeBtn",
        "#visualise",
        "#visualize",
        "[data-action='visualise']",
        "[data-action='visualize']"
      ],
      function () {
        visualiseTopic();
      }
    );

    /* CLEAR */

    connectButton(
      [
        "#clearBtn",
        "#clearVisualBtn",
        "#clear",
        "[data-action='clear']"
      ],
      function () {
        clearEverything();
      }
    );

    /* 3D */

    connectButton(
      [
        "#mode3DBtn",
        "#threeDBtn",
        "#3dBtn",
        "[data-mode='3d']"
      ],
      function () {
        setMode("3d");
      }
    );

    /* IMAGE */

    connectButton(
      [
        "#modeImageBtn",
        "#imageBtn",
        "[data-mode='image']"
      ],
      function () {
        setMode("image");
      }
    );

    /* ROTATE */

    connectButton(
      [
        "#rotateBtn",
        "#rotate",
        "[data-action='rotate']"
      ],
      function () {
        rotateVisual();
      }
    );

    /* ZOOM IN */

    connectButton(
      [
        "#zoomInBtn",
        "#zoomPlusBtn",
        "#zoomPlus",
        "[data-action='zoom-in']"
      ],
      function () {
        zoomIn();
      }
    );

    /* ZOOM OUT */

    connectButton(
      [
        "#zoomOutBtn",
        "#zoomMinusBtn",
        "#zoomMinus",
        "[data-action='zoom-out']"
      ],
      function () {
        zoomOut();
      }
    );

    /* RESET */

    connectButton(
      [
        "#resetBtn",
        "#resetViewBtn",
        "#reset",
        "[data-action='reset']"
      ],
      function () {
        resetVisual();
      }
    );

    /* FIND VISUAL */

    connectButton(
      [
        "#findVisualBtn",
        "#findVisual",
        "[data-action='find-visual']"
      ],
      function () {
        findVisual();
      }
    );

    /* ENTER KEY */

    const input =
      getTopicInput();

    if (input) {

      input.addEventListener(
        "keydown",
        function (event) {

          if (
            event.key === "Enter"
          ) {

            event.preventDefault();

            visualiseTopic();
          }
        }
      );
    }

    console.log(
      "HoloVision UI buttons connected."
    );
  }

  /* =========================================================
     INITIALIZATION
     ========================================================= */

  async function initialize3DPage() {

    try {

      console.log(
        "Initializing HoloVision 3D Lab..."
      );

      connectUI();

      await createScene();

      setStatus(
        "Ready",
        "info"
      );

      console.log(
        "HoloVision 3D Page initialized."
      );

    } catch (error) {

      console.error(
        "HoloVision initialization error:",
        error
      );

      setStatus(
        "Initialization error. Check browser console.",
        "error"
      );
    }
 }
  /* =========================================================
     START
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize3DPage,
      {
        once: true
      }
    );

  } else {

    initialize3DPage();

  }

  window.HV_INITIALIZE_3D_PAGE =
    initialize3DPage;

  /* =========================================================
     FINAL PUBLIC API
     ========================================================= */

  window.HoloVision3D = {

    visualise:
      visualiseTopic,

    clear:
      clearEverything,

    setMode:
      setMode,

    rotate:
      rotateVisual,

    zoomIn:
      zoomIn,

    zoomOut:
      zoomOut,

    reset:
      resetVisual,

    findVisual:
      findVisual,

    locatePart:
      locatePart,

    askAI:
      askAssistant

  };

  console.log(
    "HoloVision AI 3D Page JS loaded successfully."
  );

})();
