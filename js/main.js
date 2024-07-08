import { addRectangle } from './rectangles.js';
import { downloadXML } from './download.js';

document.addEventListener("DOMContentLoaded", function() {
    const paper = Raphael("canvas", "100%", "100%");

    document.getElementById('add-rectangle-button').addEventListener('click', function() {
        addRectangle(paper);
    });

    document.getElementById('save-button').addEventListener('click', function() {
        downloadXML();
    });
});
