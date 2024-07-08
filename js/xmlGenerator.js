// xmlGenerator.js
import { rectangles } from './rectangles.js';
import { connections } from './connections.js';

export function generateXML() {
    const xmlDoc = document.implementation.createDocument(null, "root");

    const rectanglesElement = xmlDoc.createElement("groups");
    rectangles.forEach(rectGroup => {
        const groupEl = xmlDoc.createElement("rectGroup");
        for (let info in rectGroup.data){
            groupEl.setAttribute(info, rectGroup.data[info]);
        }
        let shapeEl;
        rectGroup.items.forEach((item) => {
            shapeEl = xmlDoc.createElement(item.type);
            if (item.type === "circle") shapeEl.setAttribute('loc', item.data('loc'));
            let attrEl;
            for(let attr in item.attrs){
                attrEl = xmlDoc.createElement(attr);
                attrEl.textContent = item.attrs[attr];
                shapeEl.appendChild(attrEl);
            }
            groupEl.appendChild(shapeEl);
        })
        rectanglesElement.appendChild(groupEl);
    });

    const connectionsElement = xmlDoc.createElement("connections");
    connections.forEach(conn => {
        const connElement = xmlDoc.createElement("connection");
        for (let item in conn){
            let itemEl;
            if (item === 'data') {
                for (let dataInfo in conn[item])
                    connElement.setAttribute(dataInfo, conn[item][dataInfo]);
            } else if (item === 'line'){
                itemEl = xmlDoc.createElement(item);
                for (let attr in conn[item].attrs)
                    itemEl.setAttribute(attr, conn[item].attrs[attr]);
                connElement.appendChild(itemEl);
            }
            else{
                itemEl = xmlDoc.createElement(item);
                itemEl.textContent = conn[item].id;
                connElement.appendChild(itemEl);
            }
        }
        
        connectionsElement.appendChild(connElement);
    });

    xmlDoc.documentElement.appendChild(rectanglesElement);
    xmlDoc.documentElement.appendChild(connectionsElement);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
}