const rectangles = [];
const connections = [];

function addRectangle(paper) {
    x = randomNumber();
    y = randomNumber();
    const rectLabel = document.getElementById('rect-text').value;
    const rectHeight = parseInt(document.getElementById('rect-height').value);
    const rectWidth = parseInt(document.getElementById('rect-width').value);
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

    // add dots on rectangle
    dots = createConnectionDots(rect, paper);

    dots.forEach(dot => group.push(dot));

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


    var hoverIn = function(){
        group.forEach(item => {
            if(item.type === "circle")
                item.attr({opacity: 1});
        });
    }

    var hoverOut = function(){
        group.forEach(item => {
            if(item.type === "circle")
                item.attr({opacity: 0});
        });
    }

    group.hover(hoverIn, hoverOut);

    return group;
}

function createConnectionDots(rect, paper){
    var dotRadius = 4;
    var dotAttrs = {
        fill: "#00f",
        cursor: "pointer",
        opacity: 0
    };

    const ra = rect.attrs;

    var dots = [
        paper.circle(ra.x + ra.width/2, ra.y, dotRadius).attr(dotAttrs),
        paper.circle(ra.x + ra.width, ra.y + ra.height/2 , dotRadius).attr(dotAttrs),
        paper.circle(ra.x + ra.width/2, ra.y + ra.height, dotRadius).attr(dotAttrs),
        paper.circle(ra.x, ra.y + ra.height/2, dotRadius).attr(dotAttrs)
    ];

    dots.forEach(dot => {
        dot.hover(
            function() {this.attr({r: 6})},
            function() {this.attr({r: 4})},
        )
    })

    return dots;
}