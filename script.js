document.addEventListener("DOMContentLoaded", async function () {
    await loadModels();
    console.log("Models Loaded!");
});

async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
}

document.getElementById("image1").addEventListener("change", function (event) {
    previewImage(event, "preview1");
});
document.getElementById("image2").addEventListener("change", function (event) {
    previewImage(event, "preview2");
});

function previewImage(event, previewId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            const img = document.getElementById(previewId);
            img.src = reader.result;
            img.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

document.getElementById("verifyButton").addEventListener("click", async function () {
    const img1 = document.getElementById("image1").files[0];
    const img2 = document.getElementById("image2").files[0];

    if (!img1 || !img2) {
        alert("Please upload both images!");
        return;
    }

    const face1 = await getFace(img1);
    const face2 = await getFace(img2);

    if (!face1 || !face2) {
        document.getElementById("result").innerText = "Face not detected in one or both images ❌";
        return;
    }

    document.getElementById("face1").src = face1.croppedFace;
    document.getElementById("face2").src = face2.croppedFace;
    document.getElementById("croppedContainer").style.display = "flex";

    const distance = faceapi.euclideanDistance(face1.descriptor, face2.descriptor);
    document.getElementById("result").innerText = distance < 0.6 ? "Verification Successful ✅" : "Please upload your original photos ❌";
});

async function getFace(imageFile) {
    const imgData = await faceapi.bufferToImage(imageFile);
    const detection = await faceapi.detectSingleFace(imgData).withFaceLandmarks().withFaceDescriptor();
    if (!detection) return null;

    const { x, y, width, height } = detection.detection.box;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imgData, x, y, width, height, 0, 0, width, height);

    return { descriptor: detection.descriptor, croppedFace: canvas.toDataURL() };
}
