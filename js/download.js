import { generateXML } from './xmlGenerator.js';
import {generateOutputObject} from "./outputGenerator.js";

export function downloadXML() {
    const output = generateOutputObject();
    // const xmlContent = generateXML();
    // const blob = new Blob([xmlContent], { type: 'application/xml' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'rectangles_connections.xml';
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // URL.revokeObjectURL(url);
}
