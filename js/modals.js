import { groupModal, saveGroupBtn, gLabelInput, gColorInput, overlay, propertyModal, savePropertiesBtn, cancelPropertiesBtn, prop1Input, prop2Input, prop3Input } from './domElements.js';
import { MODAL_DISPLAY_BLOCK, MODAL_DISPLAY_NONE } from './constants.js';
import { saveProperties, cancelProperties } from './connections.js';

export function openEditModal(group, rect, text) {
    gLabelInput.value = group.data.rectLabel;
    gColorInput.value = group.data.rectColor;

    groupModal.style.display = MODAL_DISPLAY_BLOCK;

    saveGroupBtn.onclick = function () {
        group.data.rectLabel = gLabelInput.value;
        text.attr('text', gLabelInput.value);
        group.data.rectColor = gColorInput.value;
        rect.attr('fill', gColorInput.value);

        groupModal.style.display = MODAL_DISPLAY_NONE;
    };
}

export function showPropertyModal(tempConnection) {
    overlay.style.display = MODAL_DISPLAY_BLOCK;
    propertyModal.style.display = MODAL_DISPLAY_BLOCK;

    savePropertiesBtn.onclick = function () {
        saveProperties(tempConnection);
    };
    cancelPropertiesBtn.onclick = function () {
        cancelProperties(tempConnection);
    };
}
