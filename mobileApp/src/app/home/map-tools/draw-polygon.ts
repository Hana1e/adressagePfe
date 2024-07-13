import * as L from 'leaflet';

export function drawPolygon(map: L.Map, drawnItems: L.FeatureGroup): void {
    map.off('click'); 

    let latlngs: L.LatLng[] = []; 
    let polyline: L.Polyline | null = null; 
    map.on('click', (e: L.LeafletMouseEvent) => {
        const latlng = e.latlng;
        latlngs.push(latlng); 
        drawnItems.clearLayers();
        if (latlngs.length >= 3) {// 3 pts pour polygone
            const polygon = L.polygon(latlngs, {
                color: 'blue',
                fillColor: 'lightblue',
                fillOpacity: 0.5
            });
            drawnItems.addLayer(polygon);
        } else {
            polyline = L.polyline(latlngs, { color: 'blue' }).addTo(drawnItems);
        }
    });
}
