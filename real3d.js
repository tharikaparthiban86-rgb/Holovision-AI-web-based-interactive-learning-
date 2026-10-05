// ========================================
// HOLOVISION AI
// REAL 3D HUMAN HEART
// QUICK EDIT VERSION
// ========================================

let realScene;
let realCamera;
let realRenderer;
let realControls;
let realHeart;


// ========================================
// START REAL 3D
// ========================================

function startReal3D(topic) {

    const area =
        document.getElementById(
            "visual3dArea"
        );

    if (!area) {

        alert(
            "3D area not found."
        );

        return;

    }


    area.innerHTML = `

        <div style="
            width:100%;
            padding:15px;
            box-sizing:border-box;
            text-align:center;
        ">

            <h2 style="
                color:#00eaff;
            ">
                Real 3D Visualisation
            </h2>

            <p style="
                color:#b9f7ff;
            ">
                Visualising:
                <strong>${topic}</strong>
            </p>

            <div
                id="realHeartCanvas"
                style="
                    width:100%;
                    height:430px;
                    background:#02080d;
                    border:1px solid #00eaff;
                    border-radius:20px;
                    overflow:hidden;
                    position:relative;
                "
            >

                <div
                    id="heartLoading"
                    style="
                        position:absolute;
                        top:50%;
                        left:50%;
                        transform:translate(-50%,-50%);
                        color:#00eaff;
                        z-index:5;
                    "
                >
                    Loading real human heart...
                </div>

            </div>

            <div style="
                margin-top:15px;
            ">

                <button
                    id="heartZoomIn"
                    type="button">
                    +
                </button>

                <button
                    id="heartZoomOut"
                    type="button">
                    −
                </button>

                <button
                    id="heartReset"
                    type="button">
                    Reset
                </button>

            </div>

            <p style="
                color:#8defff;
                font-size:13px;
            ">
                Drag to rotate • Pinch to zoom
            </p>

        </div>

    `;


    addHeartViewerStyle();


    const container =
        document.getElementById(
            "realHeartCanvas"
        );


    // ====================================
    // SCENE
    // ====================================

    realScene =
        new THREE.Scene();


    realScene.background =
        new THREE.Color(
            0x02080d
        );


    // ====================================
    // CAMERA
    // ====================================

    realCamera =
        new THREE.PerspectiveCamera(
            45,
            container.clientWidth /
            container.clientHeight,
            0.1,
            100
        );


    realCamera.position.set(
        0,
        0,
        3
    );


    // ====================================
    // RENDERER
    // ====================================

    realRenderer =
        new THREE.WebGLRenderer({
            antialias:true
        });


    realRenderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    realRenderer.setSize(
        container.clientWidth,
        container.clientHeight
    );


    container.appendChild(
        realRenderer.domElement
    );


    // ====================================
    // LIGHT
    // ====================================

    const light =
        new THREE.AmbientLight(
            0xffffff,
            2
        );

    realScene.add(light);


    const directional =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    directional.position.set(
        3,
        4,
        5
    );

    realScene.add(
        directional
    );


    // ====================================
    // CONTROLS
    // ====================================

    realControls =
    new THREE.OrbitControls(
        realCamera,
        realRenderer.domElement
    );

realControls.enableDamping = true;

realControls.enableRotate = true;

realControls.enableZoom = true;

realControls.enablePan = false;

realControls.rotateSpeed = 0.8;

realControls.zoomSpeed = 1.0;

realControls.minDistance = 1.3;

realControls.maxDistance = 7;

// Mobile touch controls
realControls.touches.ONE =
    THREE.TOUCH.ROTATE;

realControls.touches.TWO =
    THREE.TOUCH.DOLLY_PAN;

// Automatic rotation
realControls.autoRotate = true;

realControls.autoRotateSpeed = 3.0;


    // ====================================
    // LOAD GLB
    // ====================================

    loadHeartModel(
        container
    );
      
      startHeartLearningFlow(topic);

    // ====================================
    // BUTTONS
    // ====================================

    document
        .getElementById(
            "heartZoomIn"
        )
        ?.addEventListener(
            "click",
            function () {

                realCamera.position
                    .multiplyScalar(0.8);

            }
        );


    document
        .getElementById(
            "heartZoomOut"
        )
        ?.addEventListener(
            "click",
            function () {

                realCamera.position
                    .multiplyScalar(1.2);

            }
        );


    document
        .getElementById(
            "heartReset"
        )
        ?.addEventListener(
            "click",
            function () {

                realCamera.position.set(
                    0,
                    0,
                    3
                );

                realControls.reset();

            }
        );


    animateHeart();


    window.addEventListener(
        "resize",
        resizeHeartViewer
    );

}


// ========================================
// GLB LOADER
// ========================================

function loadHeartModel(
    container
) {

    const loader =
        new THREE.GLTFLoader();


    loader.load(

        "./models/heart.glb",

        function (gltf) {

            realHeart =
                gltf.scene;


            realScene.add(
                realHeart
            );


            // Center model

            const box =
                new THREE.Box3()
                    .setFromObject(
                        realHeart
                    );


            const center =
                box.getCenter(
                    new THREE.Vector3()
                );


            realHeart.position.sub(
                center
            );


            // Scale model

            const size =
                box.getSize(
                    new THREE.Vector3()
                );


            const maxSize =
                Math.max(
                    size.x,
                    size.y,
                    size.z
                );


            realHeart.scale.setScalar(
                2 / maxSize
            );


            const loading =
                document.getElementById(
                    "heartLoading"
                );


            if (loading) {
                loading.style.display =
                    "none";
            }


            console.log(
                "REAL HUMAN HEART LOADED"
            );

        },

        function () {

            console.log(
                "Loading heart model..."
            );

        },

        function (error) {

            console.error(
                "Heart GLB Error:",
                error
            );


            const loading =
                document.getElementById(
                    "heartLoading"
                );


            if (loading) {

                loading.textContent =
                    "heart.glb not found";

            }

        }

    );

}


// ========================================
// ANIMATION
// ========================================

function animateHeart() {

    requestAnimationFrame(
        animateHeart
    );


    if (realControls) {
        realControls.update();
    }


    if (realRenderer) {

        realRenderer.render(
            realScene,
            realCamera
        );

    }

}


// ========================================
// RESIZE
// ========================================

function resizeHeartViewer() {

    const container =
        document.getElementById(
            "realHeartCanvas"
        );


    if (!container) {
        return;
    }


    realCamera.aspect =
        container.clientWidth /
        container.clientHeight;


    realCamera.updateProjectionMatrix();


    realRenderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

}


// ========================================
// STYLE
// ========================================

function addHeartViewerStyle() {

    if (
        document.getElementById(
            "heart3dStyle"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "heart3dStyle";


    style.textContent = `

        #realHeartCanvas canvas {
            width:100%;
            height:100%;
            display:block;
            touch-action:none;
        }

        #heartZoomIn,
        #heartZoomOut,
        #heartReset {
            padding:10px 20px;
            margin:5px;
            border:1px solid #00eaff;
            border-radius:10px;
            background:#031522;
            color:#00eaff;
            font-size:18px;
        }

    `;


    document.head.appendChild(
        style
    );

}

// ========================================
// AI HEART LEARNING FLOW
// ========================================

function startHeartLearningFlow(topic) {

    // Step 1: Show the real heart first
    setTimeout(function () {

        showHeartStage();

    }, 1500);


    // Step 2: Show anatomy information
    setTimeout(function () {

        showHeartAnatomy();

    }, 6000);


    // Step 3: AI explanation + voice
    setTimeout(function () {

        showAIHeartExplanation(topic);

    }, 10000);
}


// ========================================
// HEART STAGE
// ========================================

function showHeartStage() {

    const title =
        document.querySelector(
            "#realHeartCanvas"
        );

    if (!title) return;

    console.log(
        "Stage 1: Real heart"
    );
}


// ========================================
// ANATOMY STAGE
// ========================================

function showHeartAnatomy() {

    const area =
        document.getElementById(
            "realHeartCanvas"
        );

    if (!area) return;


    const label =
        document.createElement("div");


    label.id =
        "heartAnatomyInfo";


    label.innerHTML = `
        <div style="
            position:absolute;
            left:15px;
            bottom:15px;
            right:15px;
            padding:12px;
            background:rgba(0,20,30,.90);
            border:1px solid #00eaff;
            border-radius:12px;
            color:#b9f7ff;
            font-size:14px;
            z-index:10;
        ">

            <strong style="color:#00eaff;">
                ❤️ HUMAN HEART — MAIN PARTS
            </strong>

            <br><br>

            • Right Atrium<br>
            • Right Ventricle<br>
            • Left Atrium<br>
            • Left Ventricle<br>
            • Aorta<br>
            • Pulmonary Artery<br>
            • Pulmonary Veins<br>
            • Vena Cava

        </div>
    `;


    area.appendChild(label);


    console.log(
        "Stage 2: Heart anatomy"
    );
}


// ========================================
// AI EXPLANATION
// ========================================

function showAIHeartExplanation(topic) {

    const area =
        document.getElementById(
            "realHeartCanvas"
        );

    if (!area) return;


    const explanation =
        document.createElement("div");


    explanation.id =
        "aiHeartExplanation";


    explanation.innerHTML = `
        <div style="
            position:absolute;
            top:15px;
            left:15px;
            right:15px;
            padding:12px;
            background:rgba(0,10,20,.92);
            border:1px solid #00eaff;
            border-radius:12px;
            color:white;
            z-index:11;
            font-size:14px;
        ">

            <strong style="color:#00eaff;">
                🤖 HoloVision AI Explanation
            </strong>

            <br><br>

            The human heart is a muscular organ
            that pumps blood throughout the body.
            The right side sends oxygen-poor blood
            to the lungs, while the left side sends
            oxygen-rich blood to the body.

        </div>
    `;


    area.appendChild(
        explanation
    );


    // Voice explanation
    speakHeartExplanation();

    console.log(
        "Stage 3: AI explanation + voice"
    );
}


// ========================================
// AI VOICE
// ========================================

function speakHeartExplanation() {

    if (
        !("speechSynthesis" in window)
    ) {
        console.log(
            "Speech synthesis not supported"
        );

        return;
    }


    const text =
        "The human heart is a muscular organ "
        + "that pumps blood throughout the body. "
        + "The right side sends oxygen-poor blood "
        + "to the lungs, while the left side sends "
        + "oxygen-rich blood to the body.";


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.rate = 0.9;

    speech.pitch = 1;

    speech.volume = 1;


    window.speechSynthesis.speak(
        speech
    );
}