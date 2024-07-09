// helpers.js
import {connections} from './connections.js';
import {updateConnectionDots} from './connections.js';
import {minDelayInput, maxDelayInput} from './domElements.js';

export function randomNumber() {
    return Math.floor(Math.random() * 500) + 100;
}

export function clearPropertyInputs() {
    minDelayInput.value = '';
    maxDelayInput.value = '';
}

// Helper function to create an icon
export function createIcon(paper, x, y, iconText, group, clickHandler) {
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
export function enableDragging(group, rect, text) {
    let pdx, pdy;

    const startDrag = function () {
        pdx = 0;
        pdy = 0;
        group.attr({opacity: 0.5}).toFront(); // Set opacity and bring to front
    };

    const moveDrag = function (dx, dy) {
        const newDx = dx - pdx;
        const newDy = dy - pdy;

        // Get canvas dimensions
        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();
        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;

        // Get current position and dimensions of the rectangle
        const rectX = rect.attrs.x;
        const rectY = rect.attrs.y;
        const rectWidth = rect.attrs.width;
        const rectHeight = rect.attrs.height;

        // Calculate new position
        let newX = rectX + newDx;
        let newY = rectY + newDy;

        // Boundary checks
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + rectWidth > canvasWidth) newX = canvasWidth - rectWidth;
        if (newY + rectHeight > canvasHeight) newY = canvasHeight - rectHeight;

        // Calculate the actual dx and dy after boundary checks
        const actualDx = newX - rectX;
        const actualDy = newY - rectY;

        group.forEach(el => {
            switch (el.type) {
                case "circle":
                    el.attr({ cx: el.attrs.cx + actualDx, cy: el.attrs.cy + actualDy });
                    break;
                case "rect":
                case "image":
                case "text":
                    el.attr({ x: el.attrs.x + actualDx, y: el.attrs.y + actualDy });
                    break;
            }
        });

        pdx = dx;
        pdy = dy;

        // Update connection dots positions
        updateConnectionDots(group);
    };

    const endDrag = function () {
        group.attr({opacity: 1}); // Restore opacity
    };

    rect.drag(moveDrag, startDrag, endDrag);
    text.drag(moveDrag, startDrag, endDrag);
}

// Helper function to add hover effects to a group
export function addHoverEffects(group) {
    group.hover(
        () => group.forEach(item => {
            if (item.type === "circle") item.attr({opacity: 1});
            if (item.type === "text" && item.data("type") === "icon") item.attr({opacity: 1});
        }),
        () => group.forEach(item => {
            if (item.type === "circle") item.attr({opacity: 0});
            if (item.type === "text" && item.data("type") === "icon") item.attr({opacity: 0});
        })
    );
}

export function guid() {
    return ("0000" + (Math.random() * Math.pow(36, 5) << 0).toString(36)).slice(-5);
}
