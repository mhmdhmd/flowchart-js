import {rectangles as groups} from './rectangles.js';
import { connections } from './connections.js';

export function generateOutputObject() {
    let output = {nodes:[], steps:[]};
    
    groups.forEach(group => {
        output.nodes.push({uniqueId: group.data.uniqueId, operationRef : group.data.operationRef, isInitial: group.data.isInitial, isFinal: group.data.isFinal});    
    });
    
    connections.forEach(connection => {
        output.steps.push(
            {
                fromNode: connection.from.data('loc'),
                toNode: connection.to.data('loc'),
                minDelay: connection.data.minDelay,
                maxDelay: connection.data.maxDelay,
                fromProductionOperationRef: connection.from.data('group').data.operationRef,
                toProductionOperationRef: connection.to.data('group').data.operationRef
            });
    })
    
    console.log(output);
    
    return output;
}