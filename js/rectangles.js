// rectangles.js
import { RECT_HEIGHT, RECT_WIDTH, MODAL_DISPLAY_BLOCK, MODAL_DISPLAY_NONE } from './constants.js';
import {
    groupModal,
    saveGroupBtn,
    cancelGroupBtn,
    gOperationRef,
    gOperationTitle, gIsInitial, gIsFinal
} from './domElements.js';
import {randomNumber, createIcon, enableDragging, addHoverEffects, guid} from './helpers.js';
import { createConnectionDots, updateConnectionDots, connections } from './connections.js';
import { openEditModal } from './modals.js';

export const rectangles = [];

export function addRectangle(paper) {
    const x = randomNumber();
    const y = randomNumber();

    groupModal.style.display = MODAL_DISPLAY_BLOCK;

    saveGroupBtn.onclick = function () {
        // const rectLabel = gLabelInput.value;
        // const rectColor = gColorInput.value;
        const operationRef = parseInt(gOperationRef.value);
        const operationTitle = gOperationTitle.value;
        const isInitial = gIsInitial.checked;
        const isFinal = gIsFinal.checked;

        const uniqueId = guid();
        const groupRect = createDraggableRectWithText(x, y, RECT_WIDTH, RECT_HEIGHT, operationTitle, "#fbf", paper, { locationX: x, locationY: y, operationRef, operationTitle, isInitial, isFinal, uniqueId });
        rectangles.push(groupRect);
        
        console.log(rectangles);

        groupModal.style.display = MODAL_DISPLAY_NONE;

        // gLabelInput.value = '';
        // gColorInput.value = '#';
    };

    cancelGroupBtn.onclick = function () {
        groupModal.style.display = MODAL_DISPLAY_NONE;
    };
}

export function createDraggableRectWithText(x, y, width, height, labelText, color, paper, data) {
    const group = paper.set();
    group.data = data;
    

    const rect = paper.rect(x, y, width, height, 5).attr({
        fill: color,
        stroke: "#000",
        "stroke-width": 2,
        cursor: "move"
    });
    
    const text = paper.text(x + width / 2, y + height / 2, labelText).attr({
        "font-size": 20,
        "font-family": "Arial, sans-serif",
        fill: "#000",
        cursor: "move"
    }).attr("text-anchor", "middle");

    const trashIcon = createIcon(paper, x + width - 12, y + 12, '\uf00d', group, deleteGroup);
    const detailIcon = createIcon(paper, x + 12, y + 12, '\uf0ca', group, () => openEditModal(group, rect, text));

    group.push(rect, text, trashIcon, detailIcon);

    const dots = createConnectionDots(rect, paper, group);
    dots.forEach(dot => group.push(dot));

    enableDragging(group, rect, text);
    addHoverEffects(group);
    
    console.log(rect);

    return group;
}

export function deleteGroup(group) {
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

    group.forEach(item => item.remove());
    const index = rectangles.indexOf(group);
    if (index !== -1) rectangles.splice(index, 1);
}
