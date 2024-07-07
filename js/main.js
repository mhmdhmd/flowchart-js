// main.js
import { addRectangle } from './rectangles.js';

document.addEventListener("DOMContentLoaded", function() {
    const paper = Raphael("canvas", "100%", "100%");

    document.getElementById('add-rectangle-button').addEventListener('click', function() {
        addRectangle(paper);
    });
});
