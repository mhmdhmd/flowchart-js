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
    var dots = createConnectionDots(rect, paper);

    dots.forEach(dot => group.push(dot));

    // Initialize drag variables
    //var startTransform;

    var pdx, pdy;

    // Function to handle dragging start
    var startDrag = function (x, y) {
        pdx = 0;
        pdy = 0;

        //startTransform = this.transform();
        group.attr({ opacity: 0.5 });

        // Bring the group to the front
        group.toFront();
    };

    // Function to handle dragging movement
    var moveDrag = function (dx, dy) {
        //group.transform(startTransform + "T" + dx + "," + dy);
        var newDx = dx - pdx;
        var newDy = dy - pdy;

        group.forEach(function (el) {
            if (el.type === "circle") {
                el.attr({ cx: el.attrs.cx + newDx, cy: el.attrs.cy + newDy });
            } else if (el.type === "rect" || el.type === "image") {
                el.attr({ x: el.attrs.x + newDx, y: el.attrs.y + newDy });
            } else if (el.type === "text") {
                el.attr({ x: el.attrs.x + newDx, y: el.attrs.y + newDy });
            }
        });

        pdx = dx;
        pdy = dy;
    };

    // Function to handle dragging end
    var endDrag = function () {
        group.attr({ opacity: 1 });
    };

    // Enable dragging for the group
    //group.drag(moveDrag, startDrag, endDrag);
    rect.drag(moveDrag, startDrag, endDrag);
    text.drag(moveDrag, startDrag, endDrag);



    var hoverIn = function () {
        group.forEach(item => {
            if (item.type === "circle")
                item.attr({ opacity: 1 });
        });
    }

    var hoverOut = function () {
        group.forEach(item => {
            if (item.type === "circle")
                item.attr({ opacity: 0 });
        });
    }

    group.hover(hoverIn, hoverOut);

    return group;
}

function createConnectionDots(rect, paper) {
    var dotRadius = 4;
    var dotAttrs = {
        fill: "#00f",
        cursor: "pointer",
        opacity: 0
    };

    const ra = rect.attrs;

    var dots = [
        paper.circle(ra.x + ra.width / 2, ra.y, dotRadius).attr(dotAttrs),
        paper.circle(ra.x + ra.width, ra.y + ra.height / 2, dotRadius).attr(dotAttrs),
        paper.circle(ra.x + ra.width / 2, ra.y + ra.height, dotRadius).attr(dotAttrs),
        paper.circle(ra.x, ra.y + ra.height / 2, dotRadius).attr(dotAttrs)
    ];

    dots.forEach(dot => {
        dot.hover(
            function () { this.attr({ r: 6 }) },
            function () { this.attr({ r: 4 }) },
        );

        dot.node.addEventListener('mousedown', function (event) {
            console.log(event.x, event.y);
            event.stopPropagation();
        });

        dot.drag(onDotMove, onDotStart, onDotEnd);
    });

    return dots;
}

function onDotStart(dx, dy) {
    this.data("start", { x: this.attrs.cx, y: this.attrs.cy });
}

function onDotMove(dx, dy) {
    var start = this.data("start");
    var newX = start.x + dx;
    var newY = start.y + dy;

    if (!this.data("line")) {
        var line = this.paper.path(`M${start.x},${start.y}L${newX},${newY}`);
        line.attr({ stroke: "#000", "stroke-width": 2, "arrow-end": "classic-wide-long" });
        this.data("line", line);
    } else {
        this.data("line").attr({ path: `M${start.x},${start.y}L${newX},${newY}` });
    }
}

function onDotEnd() {
    // var line = this.data("line");
    // if(line){
    //     var dot2 = getDotAt(this.attr("cx"), this.attr("cy"));
    // }
}

function getDotAt(x, y) {
    rectangles.forEach(rect => {
        rect.forEach(item => {
            if (item.type === 'circle') {
                var box = item.getBBox();
                if (x > box.x && x < box.x2 && y > box.y && y < box.y2)
                    return item;
            }
        })
    })
}