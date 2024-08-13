const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Acessa a webcam
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
    console.log("Webcam acessada com sucesso");
}).catch(error => {
    console.error("Erro ao acessar a webcam:", error);
});

// Captura a imagem da webcam e envia para análise
function captureImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log("Imagem capturada da webcam");
    return canvas.toDataURL('image/jpeg');
}

function analyzeEmotion(image) {
    const blob = dataURItoBlob(image);
    const formData = new FormData();
    formData.append('image', blob, 'webcam.jpg');
    console.log("Imagem preparada para envio");

    return fetch('/analyze_emotion', {
        method: 'POST',
        body: formData
    }).then(response => response.json()).then(data => {
        console.log("Resposta da análise de emoção:", data);
        return data;
    }).catch(error => {
        console.error("Erro na análise de emoção:", error);
    });
}

function sendMessage(message, emotion) {
    console.log("Enviando mensagem:", message, "com emoção:", emotion);
    return fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, emotion })
    }).then(response => response.json()).then(data => {
        console.log("Resposta do chatbot:", data);
        return data;
    }).catch(error => {
        console.error("Erro ao enviar mensagem:", error);
    });
}

sendButton.addEventListener('click', () => {
    const image = captureImage();
    
    analyzeEmotion(image).then(data => {
        const emotion = data.emotion;
        const message = userInput.value;

        sendMessage(message, emotion).then(data => {
            const response = data.response;
            chatBox.innerHTML += `<p><strong>Você:</strong> ${userInput.value}</p>`;
            //chatBox.innerHTML += `<p><strong>Chatbot:</strong> ${response}</p>`;
            chatBox.innerHTML += `<p><strong>Chatbot:</strong> ${response}(Sua Emoção: ${emotion})</p>`;
            userInput.value = '';
        });
    });
});

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}
