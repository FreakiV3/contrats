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
    var pseudo = document.getElementById('pseudo').value; // Ajoutez cette ligne

    if (!signatureData || !pseudo) { // Ajoutez cette condition pour vérifier si le pseudo est fourni
        alert('Veuillez signer et fournir votre pseudo avant d\'enregistrer.');
        return;
    }

    sendToDiscordWebhook(signatureData, pseudo); // Modifiez cette ligne
}


function sendToDiscordWebhook(signatureData, pseudo) {
    var webhookUrl = 'https://discord.com/api/webhooks/1198749569928921119/Ajdb53H4E2Ca5zl0nUyYogHNlk5jDDUMHQifp14rNXI4-RZp_1RrOKwglvlym_6V6G1Q';

    // Création d'un élément image à partir des données de la signature
    var signatureImage = new Image();
    signatureImage.src = signatureData;

    // Attendre le chargement complet de l'image
    signatureImage.onload = function() {
        // Création d'un canvas pour dessiner l'image avec le texte
        var canvas = document.createElement('canvas');
        canvas.width = signatureImage.width;
        canvas.height = signatureImage.height;
        var ctx = canvas.getContext('2d');

        // Dessin de l'image sur le canvas
        ctx.drawImage(signatureImage, 0, 0);

        // Ajout du texte avec le pseudo au canvas
        ctx.font = '20px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText('Nouvelle signature reçue de ' + pseudo + '!', 10, canvas.height - 20);

        // Conversion du canvas en image (data URL)
        var imageDataURL = canvas.toDataURL('image/png');

        // Construction de l'objet FormData pour le formulaire
        var formData = new FormData();
        formData.append('file', dataURLtoFile(imageDataURL, 'signature.png'));
        formData.append('content', 'Nouvelle signature reçue de ' + pseudo + '!');

        // Configuration de la requête POST
        var requestOptions = {
            method: 'POST',
            body: formData,
        };

        // Envoi de la requête
        fetch(webhookUrl, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de l\'envoi au webhook. Code de statut: ' + response.status);
                }
                return response.text(); // Retourne la réponse brute (texte)
            })
            .then(data => {
                try {
                    var jsonData = JSON.parse(data);
                    console.log('Webhook response:', jsonData);
                } catch (error) {
                    // La réponse n'est pas au format JSON, afficher le contenu brut
                    console.log('Réponse du serveur Discord (non JSON):', data);
                }
            })
            .catch(error => {
                console.error('Erreur lors de l\'envoi au webhook:', error.message);
            });
    };
}

// Fonction utilitaire pour convertir une data URL en fichier
function dataURLtoFile(dataURL, filename) {
    var arr = dataURL.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}
