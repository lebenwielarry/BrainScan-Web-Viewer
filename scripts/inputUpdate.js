// Funktion zum Aktualisieren des Eingabefelds nach Bewegung des Sliders
function updateInput(inputId, value) {
    document.getElementById(inputId).value = value;
}

// Funktion zum Aktualisieren des Sliderwerts, wenn das Eingabefeld geändert wird
function updateSlider(sliderId, value) {
    document.getElementById(sliderId).value = value;
}

// Modal JavaScript hinzufügen
var modal = document.getElementById("myModal");
var modalImg = document.getElementById("img01");
var span = document.getElementsByClassName("close")[0];


// Funktion um das Modal zu öffnen
function enlargeImage(imageElement) {
modal.style.display = "block";
modalImg.src = imageElement.src;
}

span.onclick = function() {
modal.style.display = "none";
}

window.onclick = function(event) {
if (event.target == modal) {
    modal.style.display = "none";
}
}


// Event-Listener um die Bilder zu vergrößern
document.getElementById("original-image").onclick = function() {
enlargeImage(this);
}
document.getElementById("processed-image").onclick = function() {
enlargeImage(this);
}
document.getElementById("result-image").onclick = function() {
enlargeImage(this);
}