const rectangles = [];
const connections = [];

// Constants
const RECT_HEIGHT = 80;
const RECT_WIDTH = 170;
const DOT_RADIUS = 4;
const DOT_HOVER_RADIUS = 6;
const MODAL_DISPLAY_BLOCK = 'block';
const MODAL_DISPLAY_NONE = 'none';

// Cache DOM elements
const groupModal = document.getElementById('group-modal');
const saveGroupBtn = document.getElementById('save-group');
const cancelGroupBtn = document.getElementById('cancel-group');
const gLabelInput = document.getElementById('g-label');
const gColorInput = document.getElementById('g-color');
const overlay = document.getElementById('overlay');
const propertyModal = document.getElementById('property-modal');
const savePropertiesBtn = document.getElementById('save-properties');
const cancelPropertiesBtn = document.getElementById('cancel-properties');
const prop1Input = document.getElementById('prop1');
const prop2Input = document.getElementById('prop2');
const prop3Input = document.getElementById('prop3');

// Function to add a rectangle group to the paper
function addRectangle(paper) {
    const x = randomNumber();
    const y = randomNumber();

    // Display the group modal
    groupModal.style.display = MODAL_DISPLAY_BLOCK;

    // Handle save action
    saveGroupBtn.onclick = function () {
        const rectLabel = gLabelInput.value;
        const rectColor = gColorInput.value;

        const groupRect = createDraggableRectWithText(x, y, RECT_WIDTH, RECT_HEIGHT, rectLabel, rectColor, paper, { rectLabel, rectHeight: RECT_HEIGHT, rectWidth: RECT_WIDTH, rectColor });
        rectangles.push(groupRect);

        // Close modal after adding rectangle
        groupModal.style.display = MODAL_DISPLAY_NONE;

        // Clear the input fields
        gLabelInput.value = '';
        gColorInput.value = '#';
    };

    // Handle cancel action
    cancelGroupBtn.onclick = function () {
        // Close modal without adding rectangle
        groupModal.style.display = MODAL_DISPLAY_NONE;
    };
}

// Function to create a draggable rectangle with text and connection dots
function createDraggableRectWithText(x, y, width, height, labelText, color, paper, data) {
    const group = paper.set();
    group.data = data;

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

    // Create trash icon
    const trashIcon = createIcon(paper, x + width - 12, y + 12, '\uf00d', group, deleteGroup);

    // Create detail icon
    const detailIcon = createIcon(paper, x + 12, y + 12, '\uf0ca', group, () => openEditModal(group, rect, text));

    // Add rectangle and text to the group
    group.push(rect, text, trashIcon, detailIcon);

    // Create connection dots
    const dots = createConnectionDots(rect, paper, group);
    dots.forEach(dot => group.push(dot));

    // Enable dragging for the group
    enableDragging(group, rect, text);

    // Hover effects for circles
    addHoverEffects(group);

    return group;
}

// Helper function to generate random number for positioning
function randomNumber() {
    return Math.floor(Math.random() * 500) + 100;
}

// Function to delete a group and its connections
function deleteGroup(group) {
    // Remove connections associated with the group
    const indexes = [];
    connections.forEach((conn, index) => {
        if (conn.from.data("group") === group || conn.to.data("group") === group) {
            conn.line.remove();
            indexes.push(index);
        }
    });

    indexes.sort((a, b) => b - a);
    for (let i = 0; i < indexes.length; i++) {
        connections.splice(indexes[i], 1);
    }

    // Remove the group from rectangles and the canvas
    group.forEach(item => item.remove());
    const index = rectangles.indexOf(group);
    if (index !== -1) rectangles.splice(index, 1);
}

function openEditModal(group, rect, text) {
    // Fill modal inputs with existing values
    gLabelInput.value = group.data.rectLabel;
    gColorInput.value = group.data.rectColor;

    // Show the modal
    groupModal.style.display = MODAL_DISPLAY_BLOCK;

    // Update save button to update instead of adding new
    saveGroupBtn.onclick = function () {
        // Update properties with new values
        group.data.rectLabel = gLabelInput.value;
        text.attr('text', gLabelInput.value);
        group.data.rectColor = gColorInput.value;
        rect.attr('fill', gColorInput.value);

        // Close modal after update
        groupModal.style.display = MODAL_DISPLAY_NONE;
    };
}

// Function to create connection dots for a rectangle
function createConnectionDots(rect, paper, group) {
    const dotAttrs = {
        fill: "#00f",
        cursor: "pointer",
        opacity: 0
    };

    const ra = rect.attrs;
    const dots = [
        paper.circle(ra.x + ra.width / 2, ra.y, DOT_RADIUS).attr(dotAttrs),
        paper.circle(ra.x + ra.width, ra.y + ra.height / 2, DOT_RADIUS).attr(dotAttrs),
        paper.circle(ra.x + ra.width / 2, ra.y + ra.height, DOT_RADIUS).attr(dotAttrs),
        paper.circle(ra.x, ra.y + ra.height / 2, DOT_RADIUS).attr(dotAttrs)
    ];

    dots.forEach(dot => {
        dot.hover(
            () => dot.attr({ r: DOT_HOVER_RADIUS }),
            () => dot.attr({ r: DOT_RADIUS })
        );

        dot.node.addEventListener('mousedown', event => event.stopPropagation());

        dot.drag(onDotMove, onDotStart, onDotEnd);
        dot.data("group", group);
    });

    return dots;
}

// Function to update connection dots positions in a group
function updateConnectionDots(group) {
    group.forEach(item => {
        if (item.type === 'circle') {
            const dotX = item.attrs.cx;
            const dotY = item.attrs.cy;
            const cnnOut = connections.find(c => c.from === item);
            if (cnnOut) {
                const endX = cnnOut.line.attrs.path[1][1];
                const endY = cnnOut.line.attrs.path[1][2];
                cnnOut.line.attr({ path: `M${dotX},${dotY}L${endX},${endY}` });
            }
            const cnnIns = connections.filter(c => c.to === item);
            cnnIns.forEach(cnnIn => {
                const startX = cnnIn.line.attrs.path[0][1];
                const startY = cnnIn.line.attrs.path[0][2];
                cnnIn.line.attr({ path: `M${startX},${startY}L${dotX},${dotY}` });
            });
        }
    });
}

// Function called when a connection dot starts dragging
function onDotStart() {
    this.data("start", { x: this.attrs.cx, y: this.attrs.cy });
    connections.forEach((conn, i) => {
        if (conn.from === this) {
            conn.line.remove();
            connections.splice(i, 1);
        }
    });
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

        line.hover(
            () => line.attr({ "stroke-width": 6 }),  // Increase stroke width on hover
            () => line.attr({ "stroke-width": 2 })   // Restore stroke width
        );

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
            // Add double-click event listener to the line
            line.node.addEventListener('dblclick', () => {
                const connection = connections.find(conn => conn.line === line);
                if (connection) {
                    editConnection(connection);
                }
            });

            // Save the connection temporarily to add properties later
            const tempConnection = { from: this, to: dot2, line: line };
            showPropertyModal(tempConnection);
        } else {
            line.remove();
        }
        this.removeData("line");
    }
}

// Function to edit properties of an existing connection
function editConnection(connection) {
    const { prop1, prop2, prop3 } = connection.data || {};

    // Fill the modal inputs with the current properties
    prop1Input.value = prop1 || '';
    prop2Input.value = prop2 || '';
    prop3Input.value = prop3 || '';

    // Show the overlay and modal
    overlay.style.display = MODAL_DISPLAY_BLOCK;
    propertyModal.style.display = MODAL_DISPLAY_BLOCK;

    // Update the save button to save changes to this connection
    savePropertiesBtn.onclick = function () {
        saveProperties(connection);
    };
    cancelPropertiesBtn.onclick = function () {
        cancelProperties();
    };
}

// Function to save properties and add the connection to the connections array
function saveProperties(connection) {
    const prop1 = prop1Input.value;
    const prop2 = prop2Input.value;
    const prop3 = prop3Input.value;

    // Add properties to the connection
    if (!connection.data) {
        connection.data = {};
    }
    connection.data.prop1 = prop1;
    connection.data.prop2 = prop2;
    connection.data.prop3 = prop3;

    // Add the connection to the connections array if it's not already there
    if (!connections.includes(connection)) {
        connections.push(connection);
    }

    // Hide the overlay and modal
    overlay.style.display = MODAL_DISPLAY_NONE;
    propertyModal.style.display = MODAL_DISPLAY_NONE;

    // Clear the input fields
    clearPropertyInputs();
}

function cancelProperties(connection) {
    if (connection && !connections.includes(connection)) {
        // Remove the temporary line if it was not already saved
        connection.line.remove();
    }

    // Hide the overlay and modal
    overlay.style.display = MODAL_DISPLAY_NONE;
    propertyModal.style.display = MODAL_DISPLAY_NONE;

    // Clear the input fields
    clearPropertyInputs();
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
                    if (distance <= DOT_HOVER_RADIUS) {
                        return el; // Return the circle element directly
                    }
                }
            }
        }
    }
    return null; // Return null if no matching circle is found
}

// Helper function to create an icon
function createIcon(paper, x, y, iconText, group, clickHandler) {
    const icon = paper.text(x, y, iconText).attr({
        "font-family": "\"Font Awesome 5 Free\"",
        "font-weight": "900",
        "font-size": 18,
        fill: "#000",
        cursor: "pointer",
        opacity: 0 // Hidden initially
    }).data("group", group).data("type", "icon");

    icon.node.addEventListener('click', () => clickHandler(icon.data("group")));

    return icon;
}

// Helper function to enable dragging for a group
function enableDragging(group, rect, text) {
    let pdx, pdy;

    const startDrag = function () {
        pdx = 0;
        pdy = 0;
        group.attr({ opacity: 0.5 }).toFront(); // Set opacity and bring to front
    };

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

    const endDrag = function () {
        group.attr({ opacity: 1 }); // Restore opacity
    };

    rect.drag(moveDrag, startDrag, endDrag);
    text.drag(moveDrag, startDrag, endDrag);
}

// Helper function to add hover effects to a group
function addHoverEffects(group) {
    group.hover(
        () => group.forEach(item => {
            if (item.type === "circle") item.attr({ opacity: 1 });
            if (item.type === "text" && item.data("type") === "icon") item.attr({ opacity: 1 });
        }),
        () => group.forEach(item => {
            if (item.type === "circle") item.attr({ opacity: 0 });
            if (item.type === "text" && item.data("type") === "icon") item.attr({ opacity: 0 });
        })
    );
}

// Helper function to show the property modal
function showPropertyModal(tempConnection) {
    overlay.style.display = MODAL_DISPLAY_BLOCK;
    propertyModal.style.display = MODAL_DISPLAY_BLOCK;

    savePropertiesBtn.onclick = function () {
        saveProperties(tempConnection);
    };
    cancelPropertiesBtn.onclick = function () {
        cancelProperties(tempConnection);
    };
}

// Helper function to clear property input fields
function clearPropertyInputs() {
    prop1Input.value = '';
    prop2Input.value = '';
    prop3Input.value = '';
}
