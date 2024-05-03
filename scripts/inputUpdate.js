/**
 * Updates the value of an input field to match the value of a slider.
 * @param {string} inputId - The ID of the input field to update.
 * @param {number} value - The new value to set on the input field.
 */
 function updateInput(inputId, value) {
    document.getElementById(inputId).value = value;
}

/**
 * Updates the value of a slider to match the value entered in an associated input field.
 * @param {string} sliderId - The ID of the slider to update.
 * @param {number} value - The new value to set on the slider.
 */
function updateSlider(sliderId, value) {
    document.getElementById(sliderId).value = value;
}


/**
 * Variable definition
 */
var modal = document.getElementById("myModal");
var modalImg = document.getElementById("img01");
var span = document.getElementsByClassName("close")[0];


/**
 * Displays a modal with a larger version of an image when the image is clicked.
 * @param {Element} imageElement - The image element to display in the modal.
 */
 function enlargeImage(imageElement) {
    modal.style.display = "block";
    modalImg.src = imageElement.src;
}


// Event listeners for image click to enlarge image.
document.getElementById("original-image").onclick = function() {
    enlargeImage(this);
};
document.getElementById("processed-image").onclick = function() {
    enlargeImage(this);
};
document.getElementById("result-image").onclick = function() {
    enlargeImage(this);
};

// Closing the modal when clicking on 'close' span or outside of the modal.
span.onclick = function() {
    modal.style.display = "none";
};
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};