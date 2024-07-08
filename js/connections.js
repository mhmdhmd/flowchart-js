// connections.js
import { DOT_RADIUS, DOT_HOVER_RADIUS, MODAL_DISPLAY_BLOCK, MODAL_DISPLAY_NONE } from './constants.js';
import { overlay, propertyModal, savePropertiesBtn, cancelPropertiesBtn, minDelayInput, maxDelayInput } from './domElements.js';
import { clearPropertyInputs } from './helpers.js';
import { showPropertyModal } from './modals.js';
import { rectangles } from './rectangles.js';

export const connections = [];

export function createConnectionDots(rect, paper, group) {
    const dotAttrs = {
        fill: "#00f",
        cursor: "pointer",
        opacity: 0
    };

    const ra = rect.attrs;
    const dots = [
        paper.circle(ra.x + ra.width / 2, ra.y, DOT_RADIUS).attr(dotAttrs).data('loc', 'tt'),
        paper.circle(ra.x + ra.width, ra.y + ra.height / 2, DOT_RADIUS).attr(dotAttrs).data('loc', 'rr'),
        paper.circle(ra.x + ra.width / 2, ra.y + ra.height, DOT_RADIUS).attr(dotAttrs).data('loc', 'bb'),
        paper.circle(ra.x, ra.y + ra.height / 2, DOT_RADIUS).attr(dotAttrs).data('loc', 'll')
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

export function updateConnectionDots(group) {
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

function onDotStart() {
    this.data("start", { x: this.attrs.cx, y: this.attrs.cy });
    connections.forEach((conn, i) => {
        if (conn.from === this) {
            conn.line.remove();
            connections.splice(i, 1);
        }
    });
}

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
            () => line.attr({ "stroke-width": 6 }),
            () => line.attr({ "stroke-width": 2 })
        );

        this.data("line", line);
    } else {
        this.data("line").attr({ path: `M${start.x},${start.y}L${newX},${newY}` });
    }
}

function onDotEnd() {
    const line = this.data("line");
    if (line) {
        const x = line.attrs.path[1][1];
        const y = line.attrs.path[1][2];
        const dot2 = getDotAt(x, y, this.data('group'));
        if (dot2) {
            line.node.addEventListener('dblclick', () => {
                const connection = connections.find(conn => conn.line === line);
                if (connection) {
                    editConnection(connection);
                }
            });

            const tempConnection = { from: this, to: dot2, line: line };
            showPropertyModal(tempConnection);
        } else {
            line.remove();
        }
        this.removeData("line");
    }
}

export function editConnection(connection) {
    const { minDelay, maxDelay } = connection.data || {};

    minDelayInput.value = minDelay || '';
    maxDelayInput.value = maxDelay || '';

    overlay.style.display = MODAL_DISPLAY_BLOCK;
    propertyModal.style.display = MODAL_DISPLAY_BLOCK;

    savePropertiesBtn.onclick = function () {
        saveProperties(connection);
    };
    cancelPropertiesBtn.onclick = function () {
        cancelProperties();
    };
}

export function saveProperties(connection) {
    const minDelay = minDelayInput.value;
    const maxDelay = maxDelayInput.value;

    if (!connection.data) {
        connection.data = {};
    }
    connection.data.minDelay = minDelay;
    connection.data.maxDelay = maxDelay;

    if (!connections.includes(connection)) {
        connections.push(connection);
    }

    overlay.style.display = MODAL_DISPLAY_NONE;
    propertyModal.style.display = MODAL_DISPLAY_NONE;

    clearPropertyInputs();
}

export function cancelProperties(connection) {
    if (connection && !connections.includes(connection)) {
        connection.line.remove();
    }

    overlay.style.display = MODAL_DISPLAY_NONE;
    propertyModal.style.display = MODAL_DISPLAY_NONE;

    clearPropertyInputs();
}

function getDotAt(x, y, group) {
    for (let i = 0; i < rectangles.length; i++) {
        const rectGroup = rectangles[i];
        if (rectGroup !== group) {
            for (let j = 0; j < rectGroup.length; j++) {
                const el = rectGroup[j];
                if (el.type === 'circle') {
                    const distance = Math.sqrt(Math.pow(x - el.attrs.cx, 2) + Math.pow(y - el.attrs.cy, 2));
                    if (distance <= DOT_HOVER_RADIUS) {
                        return el;
                    }
                }
            }
        }
    }
    return null;
}
