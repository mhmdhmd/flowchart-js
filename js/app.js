const rectangles = [];
const connections = [];

// Function to add a rectangle group to the paper
function addRectangle(paper) {
    const x = randomNumber();
    const y = randomNumber();
    const rectLabel = document.getElementById('rect-text').value;
    const rectHeight = parseInt(document.getElementById('rect-height').value);
    const rectWidth = parseInt(document.getElementById('rect-width').value);
    const rectColor = document.getElementById('rect-color').value;

    const groupRect = createDraggableRectWithText(x, y, rectWidth, rectHeight, rectLabel, rectColor, paper);
    rectangles.push(groupRect);
}

// Helper function to generate random number for positioning
function randomNumber() {
    return Math.floor(Math.random() * 500) + 100;
}

// Function to create a draggable rectangle with text and connection dots
function createDraggableRectWithText(x, y, width, height, labelText, color, paper) {
    const group = paper.set();

    // Create rectangle
    const rect = paper.rect(x, y, width, height, 5).attr({
        fill: color,
        stroke: "#000",
        "stroke-width": 2,
        cursor: "move" // Set cursor to indicate draggable
    });

    // Create text
    const text = paper.text(x + width / 2, y + height / 2, labelText).attr({
        "font-size": 20,
        "font-family": "Arial, sans-serif",
        fill: "#000",
        cursor: "move" // Set cursor to indicate draggable
    }).attr("text-anchor", "middle");

    // Add rectangle and text to the group
    group.push(rect, text);

    // Create connection dots
    const dots = createConnectionDots(rect, paper, group);
    dots.forEach(dot => group.push(dot));

    // Initialize drag variables
    let pdx, pdy;

    // Function to handle dragging start
    const startDrag = function () {
        pdx = 0;
        pdy = 0;
        group.attr({ opacity: 0.5 }).toFront(); // Set opacity and bring to front
    };

    // Function to handle dragging movement
    const moveDrag = function (dx, dy) {
        const newDx = dx - pdx;
        const newDy = dy - pdy;

        group.forEach(el => {
            switch (el.type) {
                case "circle":
                    el.attr({ cx: el.attrs.cx + newDx, cy: el.attrs.cy + newDy });
                    break;
                case "rect":
                case "image":
                case "text":
                    el.attr({ x: el.attrs.x + newDx, y: el.attrs.y + newDy });
                    break;
            }
        });

        pdx = dx;
        pdy = dy;

        // Update connection dots positions
        updateConnectionDots(group);
    };

    // Function to handle dragging end
    const endDrag = function () {
        group.attr({ opacity: 1 }); // Restore opacity
    };

    // Enable dragging for the group
    rect.drag(moveDrag, startDrag, endDrag);
    text.drag(moveDrag, startDrag, endDrag);

    // Hover effects for circles
    group.hover(
        () => group.forEach(item => { if (item.type === "circle") item.attr({ opacity: 1 }); }),
        () => group.forEach(item => { if (item.type === "circle") item.attr({ opacity: 0 }); })
    );

    return group;
}

// Function to create connection dots for a rectangle
function createConnectionDots(rect, paper, group) {
    const dotRadius = 4;
    const dotAttrs = {
        fill: "#00f",
        cursor: "pointer",
        opacity: 0
    };

    const ra = rect.attrs;
    const dots = [
        paper.circle(ra.x + ra.width / 2, ra.y, dotRadius).attr(dotAttrs),
        paper.circle(ra.x + ra.width, ra.y + ra.height / 2, dotRadius).attr(dotAttrs),
        paper.circle(ra.x + ra.width / 2, ra.y + ra.height, dotRadius).attr(dotAttrs),
        paper.circle(ra.x, ra.y + ra.height / 2, dotRadius).attr(dotAttrs)
    ];

    dots.forEach(dot => {
        dot.hover(
            () => dot.attr({ r: 6 }),
            () => dot.attr({ r: 4 })
        );

        dot.node.addEventListener('mousedown', event => event.stopPropagation());

        dot.drag(onDotMove, onDotStart, onDotEnd);
        dot.data("group", group);
    });

    return dots;
}

// Function to update connection dots positions in a group
function updateConnectionDots(group) {
    for(let i = 0; i < group.length; i++){
        if (group[i].type === 'circle'){
            const dotX = group[i].attrs.cx;
            const dotY = group[i].attrs.cy;
            var cnnOut = connections.find(c => c.from === group[i]);
            if(cnnOut){
                const endX = cnnOut.line.attrs.path[1][1];
                const endY = cnnOut.line.attrs.path[1][2];
                cnnOut.line.attr({ path: `M${dotX},${dotY}L${endX},${endY}` })
            }
            var cnnIn = connections.find(c => c.to === group[i]);
            if(cnnIn){
                const startX = cnnIn.line.attrs.path[0][1];
                const startY = cnnIn.line.attrs.path[0][2];
                cnnIn.line.attr({ path: `M${startX},${startY}L${dotX},${dotY}` })
            }
        }
    }
}

// Function called when a connection dot starts dragging
function onDotStart() {
    this.data("start", { x: this.attrs.cx, y: this.attrs.cy });
    for (let i = 0; i < connections.length; i++) {
        if (connections[i].from === this) {
            connections[i].line.remove();
            connections.splice(i, 1);
        }
    }
}

// Function called when a connection dot is being dragged
function onDotMove(dx, dy) {
    const start = this.data("start");
    const newX = start.x + dx;
    const newY = start.y + dy;

    if (!this.data("line")) {
        const line = this.paper.path(`M${start.x},${start.y}L${newX},${newY}`).attr({
            stroke: "#000",
            "stroke-width": 2,
            "arrow-end": "classic-wide-long"
        });
        this.data("line", line);
    } else {
        this.data("line").attr({ path: `M${start.x},${start.y}L${newX},${newY}` });
    }
}

// Function called when a connection dot stops dragging
function onDotEnd() {
    const line = this.data("line");
    if (line) {
        const x = line.attrs.path[1][1];
        const y = line.attrs.path[1][2];
        const dot2 = getDotAt(x, y, this.data('group'));
        if (dot2) {
            connections.push({ from: this, to: dot2, line: line });
        } else {
            line.remove();
        }
        this.removeData("line");
    }
}

// Function to get the connection dot at a specific position
function getDotAt(x, y, group) {
    for (let i = 0; i < rectangles.length; i++) {
        const rectGroup = rectangles[i];
        if (rectGroup !== group) {
            for (let j = 0; j < rectGroup.length; j++) {
                const el = rectGroup[j];
                if (el.type === 'circle') {
                    const distance = Math.sqrt(Math.pow(x - el.attrs.cx, 2) + Math.pow(y - el.attrs.cy, 2));
                    if (distance <= 6) {
                        return el; // Return the circle element directly
                    }
                }
            }
        }
    }
    return null; // Return null if no matching circle is found
}
