var canvas = document.getElementById('signatureCanvas');
var ctx = canvas.getContext('2d');
var isDrawing = false;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    document.getElementById('signature').value = canvas.toDataURL();
}

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('signature').value = '';
}

function saveSignature() {
    var signatureData = document.getElementById('signature').value;

    if (!signatureData) {
        alert('Veuillez signer avant d\'enregistrer.');
        return;
    }

    // Envoie des données au webhook Discord
    sendToDiscordWebhook(signatureData);
}

function sendToDiscordWebhook(signatureData) {
    var webhookUrl = 'https://discord.com/api/webhooks/1198749569928921119/Ajdb53H4E2Ca5zl0nUyYogHNlk5jDDUMHQifp14rNXI4-RZp_1RrOKwglvlym_6V6G1Q';

    // Construction de l'objet à envoyer au webhook
    var payload = {
        content: 'Nouvelle signature reçue!',
        embeds: [{
            title: 'Signature:',
            image: {
                url: signatureData
            }
        }]
    };

    // Configuration de la requête POST
    var requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    };

    // Envoi de la requête
    fetch(webhookUrl, requestOptions)
        .then(response => response.json())
        .then(data => console.log('Webhook response:', data))
        .catch(error => {
            if (error.response) {
                // Si la réponse contient des détails, les afficher
                console.error('Erreur lors de l\'envoi au webhook:', error.message, error.response);
            } else {
                console.error('Erreur lors de l\'envoi au webhook:', error.message);
            }
        });
}