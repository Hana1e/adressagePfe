import * as L from 'leaflet';

export function drawPolyline(map: L.Map, drawnItems: L.FeatureGroup, onCoordinateAdded: (coordinate: L.LatLng) => void, color: string = 'yellow'): void {
    map.off('click'); 

    let latlngs: L.LatLng[] = []; 
    let polyline: L.Polyline | null = null;  
    let lastClickedCircle: L.Circle | null = null;

    // Cercle au centre comme guide visuel
    let initialCircle = L.circle(map.getCenter(), {
        color: 'black',
        fillColor: 'yellow',
        fillOpacity: 1,
        radius: 5,
        weight: 2
    }).addTo(map);
    polyline = L.polyline(latlngs, { color: color }).addTo(drawnItems);
    map.on('click', (e: L.LeafletMouseEvent) => {
        const latlng = e.latlng;
        latlngs.push(latlng);  // pour ajouter nv coordinates to the array

        onCoordinateAdded(latlng);

 
        if (polyline) {
            polyline.setLatLngs(latlngs);
        } else {
            polyline = L.polyline(latlngs, { color: 'yellow' }).addTo(drawnItems);
        }

        if (initialCircle) {
            map.removeLayer(initialCircle);
            initialCircle = null;
        }

        
        if (lastClickedCircle) {
            lastClickedCircle.setLatLng(latlng);
        } else {
            lastClickedCircle = L.circle(latlng, {
                color: 'black',
                fillColor: 'yellow',
                fillOpacity: 1,
                radius: 5,
                weight: 2
            }).addTo(map);
        }
    });

  
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
        const latlng = e.latlng;
        onCoordinateAdded(latlng);  
    });
}
