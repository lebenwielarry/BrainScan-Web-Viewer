/**
 * Updates the source of an image element based on a provided image ID and button value.
 * @param {string} imageId - The ID of the image element to update.
 * @param {string} buttonValue - The button value that might affect the image path (not currently used).
 */
function calculateBrainScanFromGivenInput(imageId, buttonValue) {
    var imagePath = "/images/saggital_view.png";
    var imageElement = document.getElementById(imageId);
    imageElement.src = imagePath;
}

/**
 * Calculates and displays the difference between two images by processing their pixel data.
 */
function calculateDifference() {
    var imageElement1 = document.getElementById("original-image");
    var imageElement2 = document.getElementById("processed-image");

    // Creating canvas element for drawing images
    var canvas = document.createElement("canvas");
    canvas.width = 390;
    canvas.height = 462;
    var ctx = canvas.getContext("2d");

    // Drawing of the first image on the canvas
    ctx.drawImage(imageElement1, 0, 0, 390, 462);
    var imgData1 = ctx.getImageData(0, 0, 390, 462);

    // Drawing of the second image on the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageElement2, 0, 0, 390, 462);
    var imgData2 = ctx.getImageData(0, 0, 390, 462);

    // Creating a resolution-canvas-element 
    var resultCanvas = document.createElement("canvas");
    resultCanvas.width = 390;
    resultCanvas.height = 462;
    var resultCtx = resultCanvas.getContext("2d");

    // Calculation and color allocation
    for (var i = 0; i < imgData1.data.length; i += 4) {
        var gray1 = (imgData1.data[i] + imgData1.data[i + 1] + imgData1.data[i + 2]) / 3;
        var gray2 = (imgData2.data[i] + imgData2.data[i + 1] + imgData2.data[i + 2]) / 3;
        var diff = gray1 - gray2;

        // Normalization of the difference on the region of 0 to 255
        var intensity = Math.abs(diff) / 255;
        var red = diff > 0 ? intensity * 255 : 0;
        var blue = diff < 0 ? intensity * 255 : 0;
        var green = 0;

        // Mixing with white for white background 
        red += (1 - intensity) * 255;
        blue += (1 - intensity) * 255;
        green += (1 - intensity) * 255;

        // getting the color of the current pixel 
        resultCtx.fillStyle = `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;
        resultCtx.fillRect(i / 4 % 390, Math.floor(i / 4 / 390), 1, 1);
    }

    // Setting the src-attribute of the third image to canvas
    document.getElementById("result-image").src = resultCanvas.toDataURL("image/png");
}


/**
 * Calculates the current slice to be displayed based on the viewer's current coordinate and the selected view.
 */
function getCurrentSlice() {
var currentCoord = papayaContainers[0].viewer.currentCoord;
var selectedView = document.getElementById('viewSelect').value;
var volumeDims = papayaContainers[0].viewer.volume.header.imageDimensions;
var sliceIndex;


switch (selectedView) {
    case 'axial':
        // Invert z-axis
        sliceIndex = volumeDims.zDim - 1 - currentCoord.z;
        break;
    case 'coronal':
        // Invert y-axis 
        sliceIndex = volumeDims.yDim - 1 - currentCoord.y;
        break;
    case 'saggital':
        sliceIndex = currentCoord.x;
        break;
}

drawSlice(sliceIndex, selectedView);
}


/**
 * Draws a slice of a brain scan based on voxel data for a specific orientation.
 * @param {number} sliceIndex - The index of the slice to draw.
 * @param {string} orientation - The orientation of the slice ('axial', 'coronal', 'saggital').
 */
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


// Calculate proportion of the dimensions based on the orientation 
var aspectRatio;
if (orientation === 'axial') {
    aspectRatio = dims.xDim / dims.yDim;
} else if (orientation === 'coronal') {
    aspectRatio = dims.xDim / dims.zDim;
} else if (orientation === 'saggital') {
    aspectRatio = dims.yDim / dims.zDim;
}

// Get the new width and height based on the proportion 
var maxWidth = 390; 
var maxHeight = 462; 
var newWidth, newHeight;
if (aspectRatio > 1) {
    newWidth = maxWidth;
    newHeight = maxWidth / aspectRatio;
} else {
    newWidth = maxHeight * aspectRatio;
    newHeight = maxHeight;
}
// Update canvas size 
canvas.width = newWidth;
canvas.height = newHeight;

// The origin is in the upper left corner in the Papaya Viewer 
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

// Console Logs for debugging 
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

// Iteration through every row and column 
for (var canvasY = 0; canvasY < canvas.height; canvasY++) {
    for (var canvasX = 0; canvasX < canvas.width; canvasX++) {
        var volX, volY, volZ;

        // Calculate volume coordinates based on the scaling factor 
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

        // Calculate one-dimensional voxel index based on the 3D coordinate 
        var voxelIndex = volZ * dims.xDim * dims.yDim + volY * dims.xDim + volX;
        var voxelValue = volume.imageData.data[voxelIndex];
        var normalizedValue = ((voxelValue - minVoxelValue) / range) * 255;
        
        // Set Pixel in image object 
        var index = (canvasX + canvasY * canvas.width) * 4;
        imgData.data[index] = normalizedValue; // Rot
        imgData.data[index + 1] = normalizedValue; // Grün
        imgData.data[index + 2] = normalizedValue; // Blau
        imgData.data[index + 3] = 255; // Alpha
    }
}
// Draw ImageDate on the temporary canvas 
tempCtx.putImageData(imgData, 0, 0);

// Based on the depending orientation, there have to be made different kind of adjustments to show the image the right way
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

// Draw temporary canvas to main canvas 
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

/**
 * Normalizes a voxel value to be within the range of 0 to 255.
 * @param {number} value - The voxel value to normalize.
 * @param {number} maxValue - The maximum possible voxel value.
 * @returns {number} The normalized voxel value.
 */
function normalizeVoxelValue(value, maxValue) {
return Math.min(value, maxValue) / maxValue * 255;
}