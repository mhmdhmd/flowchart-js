document.addEventListener("DOMContentLoaded", function() {
    var paper = Raphael("canvas", "100%", "100%");

    // Load application logic from app.js
    var script = document.createElement('script');
    script.src = 'js/app.js';
    script.async = false;
    document.head.appendChild(script);

    // Add rectangle button event listener
    document.getElementById('add-rectangle-button').addEventListener('click', function() {
        addRectangle(paper);
    });
});
