import { groupModal, saveGroupBtn, gOperationRef, gOperationTitle, gIsInitial, gIsFinal, overlay, propertyModal, savePropertiesBtn, cancelPropertiesBtn } from './domElements.js';
import { MODAL_DISPLAY_BLOCK, MODAL_DISPLAY_NONE } from './constants.js';
import { saveProperties, cancelProperties } from './connections.js';

export function openEditModal(group, rect, text) {
    // gLabelInput.value = group.data.rectLabel;
    // gColorInput.value = group.data.rectColor;
    gOperationRef.value = group.data.operationRef;
    gOperationTitle.value = group.data.operationTitle;
    gIsInitial.checked = group.data.isInitial;
    gIsFinal.checked = group.data.isFinal;

    groupModal.style.display = MODAL_DISPLAY_BLOCK;

    saveGroupBtn.onclick = function () {
        group.data.operationTitle = gOperationTitle.value;
        text.attr('text', gOperationTitle.value);
        group.data.operationRef = parseInt(gOperationRef.value);
        group.data.isInitial = gIsInitial.checked;
        group.data.isFinal = gIsFinal.checked;
        

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
