const rectangles = [];

function addRectangle(paper) {
    x = randomNumber();
    y = randomNumber();
    const rectLabel = document.getElementById('rect-text').value;
    const rectHeight = document.getElementById('rect-height').value;
    const rectWidth = document.getElementById('rect-width').value;
    const rectColor = document.getElementById('rect-color').value;

    var groupRect = createDraggableRectWithText(x, y, rectWidth, rectHeight, rectLabel, rectColor, paper);

    rectangles.push(groupRect);
}

function randomNumber() {
    return Math.floor(Math.random() * 500) + 100;
}

function createDraggableRectWithText(x, y, width, height, labelText, color, paper) {
    var group = paper.set();

    // Create rectangle
    var rect = paper.rect(x, y, width, height);
    rect.attr({
        fill: color,
        stroke: "#000",
        "stroke-width": 2,
        cursor: "move" // Set cursor to indicate draggable
    });

    // Create text
    var text = paper.text(x + width / 2, y + height / 2, labelText);
    text.attr({
        "font-size": 20,
        "font-family": "Arial, sans-serif",
        fill: "#000",
        cursor: "move" // Set cursor to indicate draggable
    });

    // Center text
    text.attr("text-anchor", "middle");

    // Add rectangle and text to the group
    group.push(rect, text);

    // Initialize drag variables
    var startTransform, startDragX, startDragY;

    // Function to handle dragging start
    var startDrag = function () {
        // Store initial transformation and drag start position
        startTransform = this.transform();
        startDragX = this.getBBox().x;
        startDragY = this.getBBox().y;
        this.attr({ opacity: 0.5 });

        // Bring the group to the front
        group.toFront();
    };

    // Function to handle dragging movement
    var moveDrag = function (dx, dy) {
        group.transform(startTransform + "T" + dx + "," + dy);
    };

    // Function to handle dragging end
    var endDrag = function () {
        this.attr({ opacity: 1 });
    };

    // Enable dragging for the group
    group.drag(moveDrag, startDrag, endDrag);

    var dbclick = function() {
        console.log("db click");
    }

    group.dblclick(dbclick);

    return group;
}
