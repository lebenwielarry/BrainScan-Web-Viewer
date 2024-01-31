// Funktion zum Aktualisieren des Gehirnscans basierend auf den gegebenen Eingaben
function calculateBrainScanFromGivenInput(imageId, buttonValue) {
    var imagePath = "/images/saggital_view.png";
    var imageElement = document.getElementById(imageId);
    imageElement.src = imagePath;
}

// Funktion zur Berechnung der Differenz zwischen zwei Bildern
function calculateDifference() {
    var imageElement1 = document.getElementById("original-image");
    var imageElement2 = document.getElementById("processed-image");

    // Erstellen eines Canvas-Elements zum Zeichnen der Bilder
    var canvas = document.createElement("canvas");
    canvas.width = 390;
    canvas.height = 462;
    var ctx = canvas.getContext("2d");

    // Zeichnen des ersten Bildes auf das Canvas
    ctx.drawImage(imageElement1, 0, 0, 390, 462);
    var imgData1 = ctx.getImageData(0, 0, 390, 462);

    // Zeichnen des zweiten Bildes auf das Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageElement2, 0, 0, 390, 462);
    var imgData2 = ctx.getImageData(0, 0, 390, 462);

    // Erstellen eines Ergebnis-Canvas-Elements
    var resultCanvas = document.createElement("canvas");
    resultCanvas.width = 390;
    resultCanvas.height = 462;
    var resultCtx = resultCanvas.getContext("2d");

    // Berechnung und Farbzuweisung
    for (var i = 0; i < imgData1.data.length; i += 4) {
        var gray1 = (imgData1.data[i] + imgData1.data[i + 1] + imgData1.data[i + 2]) / 3;
        var gray2 = (imgData2.data[i] + imgData2.data[i + 1] + imgData2.data[i + 2]) / 3;
        var diff = gray1 - gray2;

        // Normalisieren der Differenz auf den Bereich von 0 bis 255
        var intensity = Math.abs(diff) / 255;
        var red = diff > 0 ? intensity * 255 : 0;
        var blue = diff < 0 ? intensity * 255 : 0;
        var green = 0;

        // Mischen mit Weiß für einen weißen Hintergrund
        red += (1 - intensity) * 255;
        blue += (1 - intensity) * 255;
        green += (1 - intensity) * 255;

        // Festlegen der Farbe für das aktuelle Pixel
        resultCtx.fillStyle = `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;
        resultCtx.fillRect(i / 4 % 390, Math.floor(i / 4 / 390), 1, 1);
    }

    // Setzen des src-Attributs des dritten Bildes auf das Canvas-Bild
    document.getElementById("result-image").src = resultCanvas.toDataURL("image/png");
}


//Aktuellen Slice berechnen (basierend auf ausgewählter View)
function getCurrentSlice() {
var currentCoord = papayaContainers[0].viewer.currentCoord;
var selectedView = document.getElementById('viewSelect').value;
var volumeDims = papayaContainers[0].viewer.volume.header.imageDimensions;
var sliceIndex;


switch (selectedView) {
    case 'axial':
        // Invertiere die Z-Achse
        sliceIndex = volumeDims.zDim - 1 - currentCoord.z;
        break;
    case 'coronal':
        // Invertiere die Y-Achse
        sliceIndex = volumeDims.yDim - 1 - currentCoord.y;
        break;
    case 'saggital':
        sliceIndex = currentCoord.x;
        break;
}

drawSlice(sliceIndex, selectedView);
}


//Funktion um das aktuelle Bild zu fetchen, anhand der Voxel Daten
function drawSlice(sliceIndex, orientation) {
var volume = papayaContainers[0].viewer.screenVolumes[0].volume;
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
canvas.width = 390;
canvas.height = 462;

var tempCanvas = document.createElement('canvas');
var tempCtx = tempCanvas.getContext('2d');
tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height;
var imgData = tempCtx.createImageData(tempCanvas.width, tempCanvas.height);

var dims = volume.header.imageDimensions;
var scaleX, scaleY, sliceOffset;


// Berechne das Verhältnis der Dimensionen basierend auf der Orientierung
var aspectRatio;
if (orientation === 'axial') {
    aspectRatio = dims.xDim / dims.yDim;
} else if (orientation === 'coronal') {
    aspectRatio = dims.xDim / dims.zDim;
} else if (orientation === 'saggital') {
    aspectRatio = dims.yDim / dims.zDim;
}

// Bestimme die neue Breite und Höhe basierend auf dem Verhältnis
var maxWidth = 390; 
var maxHeight = 462; 
var newWidth, newHeight;
if (aspectRatio > 1) {
    // Breiter als hoch
    newWidth = maxWidth;
    newHeight = maxWidth / aspectRatio;
} else {
    // Höher als breit oder quadratisch
    newWidth = maxHeight * aspectRatio;
    newHeight = maxHeight;
}
// Aktualisiere die Canvas-Größe
canvas.width = newWidth;
canvas.height = newHeight;

// Der Ursprung ist oben links im Papaya Viewer
if (orientation === 'axial') {
    scaleX = dims.xDim / canvas.width;
    scaleY = dims.yDim / canvas.height;
    sliceOffset = sliceIndex * dims.xDim * dims.yDim;
} else if (orientation === 'coronal') {
    scaleX = dims.xDim / canvas.width;
    scaleY = dims.zDim / canvas.height;
    sliceOffset = sliceIndex * dims.xDim * dims.zDim;
} else if (orientation === 'saggital') {
    scaleX = dims.yDim / canvas.width;
    scaleY = dims.zDim / canvas.height;
    sliceOffset = sliceIndex * dims.yDim * dims.zDim;
}

// Konsolen-Logs für Debugging
console.log('Orientation: ' + orientation);
console.log('Slice Index: ' + sliceIndex);
console.log('Scale X: ' + scaleX);
console.log('Scale Y: ' + scaleY);
console.log('Slice Offset: ' + sliceOffset);

var minVoxelValue = Infinity;
var maxVoxelValue = -Infinity;
for (var i = 0; i < volume.imageData.data.length; i++) {
    var value = volume.imageData.data[i];
    if (value < minVoxelValue) minVoxelValue = value;
    if (value > maxVoxelValue) maxVoxelValue = value;
}
var range = maxVoxelValue - minVoxelValue;

// Schleife durch jede Zeile und Spalte des Canvas
for (var canvasY = 0; canvasY < canvas.height; canvasY++) {
    for (var canvasX = 0; canvasX < canvas.width; canvasX++) {
        var volX, volY, volZ;

        // Berechne die Volumenkoordinaten basierend auf dem Skalierungsfaktor
        if (orientation === 'axial') {
            volX = Math.floor(canvasX * scaleX);
            volY = Math.floor(canvasY * scaleY);
            volZ = sliceIndex;
        } else if (orientation === 'coronal') {
            volX = Math.floor(canvasX * scaleX);
            volZ = Math.floor(canvasY * scaleY);
            volY = sliceIndex;
        } else if (orientation === 'saggital') {
            volY = Math.floor(canvasX * scaleX);
            volZ = Math.floor(canvasY * scaleY);
            volX = sliceIndex;
        }

        // Den eindimensionalen Voxel-Index basierend auf den 3D-Koordinaten berechnen
        var voxelIndex = volZ * dims.xDim * dims.yDim + volY * dims.xDim + volX;
        var voxelValue = volume.imageData.data[voxelIndex];
        var normalizedValue = ((voxelValue - minVoxelValue) / range) * 255;
        
        // Den Pixel im ImageData-Objekt setzen
        var index = (canvasX + canvasY * canvas.width) * 4;
        imgData.data[index] = normalizedValue; // Rot
        imgData.data[index + 1] = normalizedValue; // Grün
        imgData.data[index + 2] = normalizedValue; // Blau
        imgData.data[index + 3] = 255; // Alpha
    }
}
// Zeichne das ImageData auf das temporäre Canvas
tempCtx.putImageData(imgData, 0, 0);

// Anhand der aktuellen Orientierung, müssen bei den jeweiligen Views unterschiedliche Rotationen und oder Spiegelungen vorgenommen werden
if (orientation === 'axial') {
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.rotate(Math.PI); 
ctx.scale(-1, 1); 
ctx.translate(-canvas.width / 2, -canvas.height / 2);
} else if (orientation === 'coronal') {
    ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.rotate(Math.PI); 
ctx.scale(-1, 1); 
ctx.translate(-canvas.width / 2, -canvas.height / 2);
} else if (orientation === 'saggital') {
    ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.rotate(Math.PI);
ctx.translate(-canvas.width / 2, -canvas.height / 2);
}

// Zeichne das temporäre Canvas auf das Haupt-Canvas
ctx.drawImage(tempCanvas, 0, 0);
var imageElementId = "original-image";
var imageElement = document.getElementById('original-image');
if (imageElement) {
    imageElement.style.width = newWidth + 'px';
    imageElement.style.height = newHeight + 'px';
    imageElement.src = canvas.toDataURL();
} else {
    console.error('Das Bild-Element mit der ID "original-image" wurde nicht gefunden.');
}
}

//Normalisierung der Voxel Values um standartisiertes Bild Format zu erhalten
function normalizeVoxelValue(value, maxValue) {
return Math.min(value, maxValue) / maxValue * 255;
}