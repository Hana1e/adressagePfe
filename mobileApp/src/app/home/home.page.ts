import { Component, Input,Output,EventEmitter,OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { AlertController } from '@ionic/angular';
import { RecensementService } from '../services/recensement.service';
import { GeometryService } from './map-tools/geometry.service';
import { AlertService } from './map-tools/alert.service';
import { MapBackgroundService } from './map-tools/map-background.service';
import { GeoJsonObject, Feature, Geometry } from 'geojson';
import { GeolocationService} from './map-tools/geolocation.service';
import { PolylineDrawingService } from './map-tools/polyline-drawing.service';
import { PolygonDrawingService } from './map-tools/polygon-drawing.service';
import { AuthService } from '../services/auth.service';
import { LayerManagementService } from './map-tools/layer-management.service';
import { Observable } from 'rxjs';
import { QuartierService } from './map-tools/quartier.service';
import 'leaflet-routing-machine';
import { EnqueteComponent } from './enquete/enquete.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map: L.Map;
  drawnItems: L.FeatureGroup;
  showButtons: boolean = false;
  lastCircle: L.Circle;
  showFooter: boolean = false;
  buttonOffset: string = '10px';
  polylineCreationDate: Date | null;
  polylineCoordinates: L.LatLng[] = [];
  initialCoordinate: L.LatLng;
  showRecensement = false;
  showEnquete=false;
  currentMode: 'recensement' | 'enquete' = 'recensement';
  geoJSON: any;
  currentAction: 'polyline' | 'polygon' | null = null;
  typeGeom: 'polyline' | 'polygon' | null = null;
  lastDrawnItem: L.Polyline | L.Polygon | null = null;
  isCardVisible = true;
  isEditFormVisible=true;
  selectedGeometryId: string | null = null; 
  selectedLayer: L.Layer | null = null; 
  watchId: string;
  locationMarker: L.CircleMarker;
  private lastSelectedLayer: L.Path | null = null;
  drawingInProgress: boolean = false;
  userLayers: any[] = [];
  private geoJSONLayer: L.GeoJSON;
  area: number = 0;
  showForm: boolean = true;
  userCircle: any; 
  geometrySelectedSuccess: boolean = false;
  referencePoint: L.LatLng | null;
  @Output() geometryIdSelected: EventEmitter<string> = new EventEmitter<string>();
  @Input() enableInteraction: () => void = this.enableMapInteraction.bind(this);
  showEditFormButton: boolean = false;
  showConfirmationDialog: boolean = false;
  selectedAddress: any;
  addressId: string = '';
  canPlacePoint: boolean = true;
  initialColor: string = 'blue';
  zoomedShape: any;
  showError = true;
  address: string;
  distanceTraveled: number = 0;
  isGeneratingRoute: boolean = false;
  trackingMode: boolean = false;
  clickListener: any;
  trackingActive: boolean = false;
  routingControl: any;
  alertConfirmed: boolean = false;
  private distance: number = 0;
  polylineSelectionEnabled: boolean = false;
  polylineSelectionForced: boolean = false;
  @ViewChild(EnqueteComponent) enqueteComponent: EnqueteComponent;
showButtonsDistance: boolean = false;
  constructor(private alertController: AlertController,private recensementService: RecensementService
    ,private geometryService: GeometryService,private alertService: AlertService,
    private mapBackgroundService: MapBackgroundService,
    private geolocationService: GeolocationService,
    private polylineDrawingService: PolylineDrawingService,
    private polygonDrawingService: PolygonDrawingService,
    private authService: AuthService,
    private layerManagementService: LayerManagementService,
    private quartierService: QuartierService
  ) {}
  
  ionViewDidEnter() {
    this.initMap();
    this.authService.isLoggedIn().subscribe(authenticated => {
      if (authenticated) {
        this.layerManagementService.afficherIdCouche();
      }
    });
  }
  
  initMap() {
    this.map = L.map('mapId', {
      attributionControl: false 
    })

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(this.map);
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);
    this.polylineCoordinates = [];

    
    this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
    
      this.initialCoordinate = e.latlng; 
    });
    this.map.on('click', () => {
      if (this.lastSelectedLayer) {
          const initialColor = (this.lastSelectedLayer as any).initialColor;
          this.lastSelectedLayer.setStyle({ color: initialColor });
          this.lastSelectedLayer = null;
      }
      
      this.hideFooter();
  });
  
  
  this.layerManagementService.setMap(this.map);
  this.loadExistingGeometries();
  
  }
  commencerClickedHandler() {
    this.generateRoute(new MouseEvent('click')); 
  }
  arreterTrackingHandler() {
    this.stopTracking(new MouseEvent('click')); 
    this.showButtonsDistance = false;
    this.alertService.presentSelectBuildingAlert(() => {
      // Lorsque l'utilisateur clique sur "Sélectionner", mettre le drapeau à true
      this.alertConfirmed = true;
    });
    
  }
  
  generateRoute(event: MouseEvent) {
    event.stopPropagation();  // Empêche la propagation de l'événement de clic
   // this.trackingMode = true;
    this.clickListener = (e: L.LeafletMouseEvent) => {
      console.log('Latitude:', e.latlng.lat, 'Longitude:', e.latlng.lng);
      this.polylineCoordinates.push(e.latlng);
    };
    this.map.on('click', this.clickListener);
  }
  // Fonction pour désactiver le suivi des clics sur la carte et tracer l'itinéraire
  stopTracking(event: MouseEvent) {
    event.stopPropagation();  // Empêche la propagation de l'événement de clic
    this.trackingMode = false;
    // Vérifiez d'abord si un écouteur d'événement de clic est défini
    if (this.clickListener) {
      // Désabonnez-vous de l'événement de clic sur la carte
      this.map.off('click', this.clickListener);
      this.clickListener = null; // Effacez la référence de l'écouteur d'événement
    }

    // Utilisez leaflet-routing-machine pour afficher l'itinéraire
    if (this.polylineCoordinates.length > 1) {
      // Ajoutez le point de référence comme premier point de l'itinéraire
      if (this.referencePoint) {
        this.polylineCoordinates.unshift(this.referencePoint);
      }

      this.routingControl = L.Routing.control({
        waypoints: this.polylineCoordinates,
        routeWhileDragging: true,
      }).addTo(this.map);

      this.routingControl.on('routesfound', (e: any) => {
        const routes = e.routes;
        const summary = routes[0].summary;
        this.distance = Math.round(summary.totalDistance); // Arrondir la distance
        console.log(`Distance: ${this.distance} meters`);

        // Retirez tous les marqueurs précédents
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            this.map.removeLayer(layer);
          }
        });

        // Ajoutez des marqueurs pour le premier et le dernier point de l'itinéraire
        const firstPoint = this.polylineCoordinates[0];
        const lastPoint = this.polylineCoordinates[this.polylineCoordinates.length - 1];

        L.marker(firstPoint).addTo(this.map);
        L.marker(lastPoint).addTo(this.map);
      });

    } else {
      console.warn('Il faut au moins deux points pour générer un itinéraire.');
    }
    
  }
  resetMap() {
    // Supprimez l'itinéraire tracé
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
  
    // Supprimez tous les marqueurs
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
  
    // Réinitialisez les autres paramètres
    this.polylineCoordinates = [];
    this.trackingMode = false;
    this.alertConfirmed = false;
    this.canPlacePoint = false;
          this.removeDrawnPoint();
    console.log('Carte réinitialisée');
  }
  selectPolyline() {
    this.alertService.presentSelectPolylineAlert(() => {
      console.log('Polyline selection forced');
      this.polylineSelectionForced = true;
   
    });
  }







  cancelModification() {
    if (this.lastSelectedLayer) {
        this.lastSelectedLayer.setStyle({ color: (this.lastSelectedLayer as any).initialColor });
    }
    
}


  afficherIdCouche() {
    this.layerManagementService.afficherIdCouche();
  }
  
  hideAssignedLayer() {
    this.layerManagementService.hideAssignedLayer();
  }

  showHideQuartiers() {
    this.quartierService.toggleQuartiersVisibility(this.map);
  }
  
  onQuartierClick(layer: L.Layer): void {
    
    this.quartierService.handleQuartierClick(layer);
   
  }
  hideQuartiers(): void {
    this.quartierService.hideQuartiers(this.map);
  }
  
  
  
   loadExistingGeometries(): void {
    this.recensementService.getPolygonsByUserId().subscribe({
      next: (polygons: any[]) => {
        polygons.forEach(polygon => {
          const layer = L.geoJSON(polygon.geoJSON as GeoJsonObject, {
            style: (feature: Feature) => ({
              color: 'yellow'
            }),
            onEachFeature: (feature: Feature<Geometry>, layer: L.Layer) => {
              layer.on('click', (e: L.LeafletMouseEvent) => {
                L.DomEvent.stop(e);
                this.handleGeometryClick(layer as L.Path, polygon._id);
                this.selectedGeometryId = polygon._id;
                this.selectedLayer = layer;
                console.log("Clicked polygon ID:", polygon._id);
                this.geometryIdSelected.emit(polygon._id);
                this.geometryDetails(layer);
              });
              (layer as any).initialColor = 'yellow';
            }
          }).addTo(this.drawnItems);
        });
      },
      error: (err) => console.error('Failed to load polygons', err)
    });

    this.recensementService.getPolylinesByUserId().subscribe({
      next: (polylines: any[]) => {
        polylines.forEach(polyline => {
          const layer = L.geoJSON(polyline.geoJSON as GeoJsonObject, {
            style: (feature: Feature) => ({
              color: 'blue'
            }),
            onEachFeature: (feature: Feature<Geometry>, layer: L.Layer) => {
              layer.on('click', (e: L.LeafletMouseEvent) => {
                L.DomEvent.stop(e);
                this.handleGeometryClick(layer as L.Path, polyline._id);
                this.selectedGeometryId = polyline._id;
                this.selectedLayer = layer;
                console.log("Clicked polyline ID:", polyline._id);
                this.geometryDetails(layer);
              });
              (layer as any).initialColor = 'blue';
            }
          }).addTo(this.drawnItems);
        });
      },
      error: (err) => console.error('Failed to load polylines', err)
    });
  }
  
  handleGeometryClick(layer: L.Path, id: string) {
    const address = this.address;
    if (this.lastSelectedLayer) {
        if (this.currentMode === 'recensement') {
            this.lastSelectedLayer.setStyle({ color: 'blue' });
        }
    }
    if (this.currentMode === 'recensement') {
        layer.setStyle({ color: 'red' });
    }
    this.lastSelectedLayer = layer;

    if (layer instanceof L.Polygon) {
        this.setTypeGeom('polygon');

        if (this.currentMode === 'enquete') {
            // Récupérer l'adresse finale de l'immeuble si l'ID est défini
            if (id) {
                this.recensementService.getFinalAddressById(id).subscribe({
                    next: (finalAddress: any) => {
                        const popupContent = `<b>${finalAddress.adresseFinalImmeuble}</b>`;
                        layer.bindPopup(popupContent).openPopup();
                    },
                    error: (err) => console.error('Failed to get final address for immeuble:', err)
                });
            } else {
                console.error('Selected geometry ID is null.');
            }
        } else {
            // Si vous êtes dans le mode recensement, affichez l'adresse de l'immeuble comme avant
            if (id) {
                this.recensementService.getImmeubleAddresses().subscribe({
                    next: (immeubles: any[]) => {
                        const immeuble = immeubles.find(item => item._id === id);
                        if (immeuble) {
                            const popupContent = `<b>${immeuble.adresseImmeuble}</b>`;
                            layer.bindPopup(popupContent).openPopup();
                        } else {
                            console.log('Immeuble address not found for ID:', id);
                        }
                    },
                    error: (err) => console.error('Failed to get immeuble addresses:', err)
                });
            } else {
                console.error('Selected geometry ID is null.');
            }
        }
    } else if (layer instanceof L.Polyline) {
        this.setTypeGeom('polyline');
        if (id) {
            const polylineId = id;
            this.recensementService.getAddressFromPolyline(id).subscribe({
                next: (address: any) => {
                    console.log('Address:', address);
                    if (this.polylineSelectionForced) {
                        console.log('Address after alert button click:', address);
                        this.recensementService.getAddressGeometry(address.address).subscribe({
                            next: (data: any) => {
                                const polylineId = id;
                                const geometry = data?.geoJSON;
                                console.log(`Address: ${address.address}, Geometry:`, geometry);

                                this.polylineSelectionForced = false; 
                                this.zoomGeometry(geometry, address.address, polylineId);
                            },
                            error: (err) => console.error('Failed to fetch address geometry:', err)
                        });
                    }
                    const popupContent = `<b>${address.address}</b>`;
                    layer.bindPopup(popupContent).openPopup();
                },
                error: (err) => console.error('Failed to get address for polyline:', err)
            });
        } else {
            console.error('Selected geometry ID is null.');
        }
    } else {
        this.setTypeGeom(null);
    }

    if (this.alertConfirmed) {
        console.log("Bâtiment sélectionné :", id, address, this.distance);
        // Afficher l'alerte de confirmation pour enregistrer le numéro du bâtiment
        this.alertService.presentNumberingConfirmation(() => {
            // Callback lorsque l'utilisateur confirme l'enregistrement du numéro
            console.log("Confirmation d'enregistrement pour le bâtiment :", id);
            // Afficher l'alerte pour ajouter un caractère de numérotation
            this.alertService.presentAjoutCaractereNumerotation((selectedOption: string) => {
                console.log('Batiment sur la Rive', selectedOption); 
                const rive = selectedOption;
                this.addFinalAddressImmeuble(id, address, this.distance, rive);
                this.resetMap();
            }, () => {
                console.log('Annulation de l\'ajout du caractère de numérotation');
                this.resetMap(); 
            });
        }, () => {
            // Callback lorsque l'utilisateur annule l'enregistrement du numéro
            console.log("Enregistrement annulé pour le bâtiment :", id);
            this.resetMap();
        });
    }

    this.toggleEditFormVisibility();
    this.hideFooter();
}




  

  
  drawPolyline() {
    this.resetDrawingStates();
     
    this.isEditFormVisible= false;   
    this.lastDrawnItem = this.polylineDrawingService.drawPolyline(this.map, this.drawnItems, (polyline, e) => {
    L.DomEvent.stopPropagation(e);
    this.selectGeometry(polyline);
    this.showFooter = true;
    this.buttonOffset = '70px';
    this.getAddressForNewGeometry();
    });
    this.currentAction = 'polyline';
    this.showButtons = true;
      }
  //adress for new polylines
  getAddressForNewGeometry() {
    if (this.lastDrawnItem && this.lastDrawnItem instanceof L.Polyline) {
      const id = (this.lastDrawnItem as any).options.customId;
      this.recensementService.getAddressFromPolyline(id).subscribe({
        next: (address: any) => {
          console.log('Address:', address);
          if (this.lastDrawnItem) { // Vérifier si lastDrawnItem est défini
            const popupContent = `<b>${address.address}</b>`; // Utilisez la bonne propriété contenant l'adresse
            this.lastDrawnItem.bindPopup(popupContent).openPopup();
          }
        },
        error: (err) => console.error('Failed to get address for polyline:', err)
      });
    }
  }
  //for new drawn immeubles
  getAddressForNewPolygon() {
    if (this.lastDrawnItem && this.lastDrawnItem instanceof L.Polygon) {
      const id = (this.lastDrawnItem as any).options.customId; 
      this.recensementService.getAddressFromPolygon(id).subscribe({
        next: (address: any) => {
          console.log('Address:', address);
          if (this.lastDrawnItem) {
            const popupContent = `<b>${address.adresseImmeuble}</b>`; 
            this.lastDrawnItem.bindPopup(popupContent).openPopup();
          }
        },
        error: (err) => console.error('Failed to get address for polygon:', err)
      });
    }
  }


      
  selectGeometry(layer: L.Path) {
    if (this.lastSelectedLayer && this.lastSelectedLayer !== layer) {
      if (this.lastSelectedLayer instanceof L.Polygon) {
        this.lastSelectedLayer.setStyle({ color: 'yellow' }); // Pour  polygones
      } else if (this.lastSelectedLayer instanceof L.Polyline) {
        this.lastSelectedLayer.setStyle({ color: 'blue' }); // Pour polylignes
      }
    }
    layer.setStyle({ color: 'red' }); 
    this.lastSelectedLayer = layer; // update last layer
    
    
    this.map.off('click'); 
    this.map.on('click', () => {
      if (this.lastSelectedLayer) {
        if (this.lastSelectedLayer instanceof L.Polygon) {
          this.lastSelectedLayer.setStyle({ color: 'yellow' }); 
        } else if (this.lastSelectedLayer instanceof L.Polyline) {
          this.lastSelectedLayer.setStyle({ color: 'blue' }); 
        }
        this.lastSelectedLayer = null; 
      }
      this.hideFooter(); 
    });
  }



  handleReset() {
    this.showRecensement = false; 
    this.showEnquete = false;
    this.enableMapInteraction();  // intercation de carte
      this.polylineCoordinates = [];
      this.hideFooter();
  }
  resetDrawingStates() {
    if (this.lastSelectedLayer) {
      this.lastSelectedLayer.setStyle({ color: 'blue' });
    }
    this.showFooter = false;
    this.buttonOffset = '10px'; 
    this.showButtons = false;
   
    this.currentAction = null;
      this.showRecensement = false;
      this.showEnquete = false;
        
  }
  onOKButtonClicked() {
    if (this.lastDrawnItem && (this.lastDrawnItem instanceof L.Polyline || this.lastDrawnItem instanceof L.Polygon)) {
      this.geoJSON = this.lastDrawnItem.toGeoJSON();
      const geoJSONString = JSON.stringify(this.geoJSON);
      console.log(geoJSONString);
    } else {
      console.log("No valid drawable item or item does not support GeoJSON conversion.");
    }
  
    this.resetMapEventsAndState();
    this.polylineCreationDate = new Date();
  
    if (this.currentMode === 'recensement') {
      if (this.currentAction === 'polyline' || this.currentAction === 'polygon') {
        this.showRecensement = true;
        this.showEnquete = false; // Ne pas afficher le formulaire d'enquête
      }
    } else if (this.currentMode === 'enquete') {
      if (this.currentAction === 'polyline' || this.currentAction === 'polygon') {
        this.showRecensement = false; // Ne pas afficher le formulaire de recensement
        this.showEnquete = true;
      }
    } else {
      // Si le mode n'est ni "recensement" ni "enquete", désactiver les deux formulaires
      this.showRecensement = false;
      this.showEnquete = false;
    }
  
    this.disableMapInteraction();
  }
  
  resetMapEventsAndState() {
      this.map.off('click');
      this.map.off('mousemove');
      this.showButtons = false;
      this.showFooter = true;
      this.buttonOffset = '70px';
      this.showRecensement = false;
      this.showEnquete = false; 
  }

  drawPolygon() {
    this.resetDrawingStates();
    this.isCardVisible = true; 
   this.isEditFormVisible= false; 
     
    this.lastDrawnItem = this.polygonDrawingService.drawPolygon(this.map, this.drawnItems, (polygon, e) => {
      this.selectGeometry(polygon);
      this.showFooter = true;
      this.buttonOffset = '70px';
      this.getAddressForNewPolygon();
    });
    this.currentAction = 'polygon';
    this.showButtons = true;
  }
  

  changeMapBackground(event: CustomEvent) {
    const value = event.detail.value as 'recensement' | 'enquete';
    this.mapBackgroundService.changeMapBackground(this.map, value);
  }

  onCancelButtonClicked() {
    if (this.currentAction && this.lastDrawnItem) {
        this.drawnItems.removeLayer(this.lastDrawnItem); 
        this.lastDrawnItem = null;
        this.currentAction = null; 
    }
    this.showButtons = false;
    this.showFooter = false;
    this.buttonOffset = '10px';
    this.isCardVisible = false;
}
  resetDrawing() {
    this.showButtons = false;
    this.showFooter = false;
}
  hideFooter() {
      this.showFooter = false;
      this.buttonOffset = '10px'; 
  }
  
  handleCancelDrawing() {
    if (this.lastDrawnItem) {
      this.drawnItems.removeLayer(this.lastDrawnItem); 
      this.lastDrawnItem = null;}
    this.hideFooter();
   
    this.polylineCreationDate = null; 
    this.enableMapInteraction();
    this.geoJSON = null; 
  }
  geometryDetails(layer: L.Layer) {
      
    if (this.currentMode === 'enquete') {
      this.showFooter = false;
    } else {
      this.showFooter = true;
      this.buttonOffset = '70px';
    }
   
  }
  handleUpdateDetails(event: { id: string, item: L.Layer }) {

    if (event.item) {
        (event.item as any).customId = event.id;  
        console.log(`ID updated for geometry: ${event.id}`);
        this.polylineCreationDate = null;
        this.hideFooter();
      }
        this.selectedLayer = event.item;
        this.selectedGeometryId = event.id;
        if (this.typeGeom === 'polyline' || this.typeGeom === 'polygon') {
          this.isEditFormVisible = true;
        } else {
          this.isEditFormVisible = false;
        }

        
} 


setTypeGeom(action: 'polyline' | 'polygon' | null) {
  this.typeGeom = action;
  this.toggleEditFormVisibility(); 
}
disableMapInteraction() {
  this.map.dragging.disable();
  this.map.touchZoom.disable();
  this.map.doubleClickZoom.disable();
  this.map.scrollWheelZoom.disable();
  this.map.boxZoom.disable();
  this.map.keyboard.disable();
  if (this.map.tap) this.map.tap.disable();}

enableMapInteraction() {
  this.map.dragging.enable();
  this.map.touchZoom.enable();
  this.map.doubleClickZoom.enable();
  this.map.scrollWheelZoom.enable();
  this.map.boxZoom.enable();
  this.map.keyboard.enable();
  if (this.map.tap) this.map.tap.enable();}


toggleEditFormVisibility() {
  if (this.typeGeom === 'polyline' || this.typeGeom === 'polygon') {
    this.isEditFormVisible = !this.isEditFormVisible;
  }
}

deleteGeometry(id: string, layer: L.Layer) {
  if (!id) {
    console.error('Invalid ID for deletion');
    return;
  }

  let type: 'polyline' | 'polygon';

  // Déterminer le type de géométrie
  if (layer instanceof L.Polyline) {
    type = 'polyline';
  } else if (layer instanceof L.Polygon) {
    type = 'polygon';
  } else {
    console.error('Unknown geometry type');
    return;
  }

  // Appeler le service pour supprimer la géométrie
  this.recensementService.deleteGeometry(id, type).subscribe({
    next: () => {
      // Supprimer la couche de la carte
      this.map.removeLayer(layer);
      console.log('Geometry deleted successfully');
      const index = this.userLayers.findIndex(item => item.id === id);
      if (index !== -1) {
        this.userLayers.splice(index, 1);
      }

      this.showFooter = false; 
      this.buttonOffset = '10px';
    },
    error: (error) => {
      console.error('Failed to delete geometry', error);
    }
  });
}

async presentAlert() {
 
  if (!this.selectedGeometryId || !this.selectedLayer) {
    console.error('No geometry selected for deletion or no corresponding layer available');
    return;
  }
  await this.alertService.presentConfirmationAlert(
      'Êtes-vous sûr de vouloir supprimer cet élément ?',
      '',
      () => {
          console.log('Élément supprimé');
          this.deleteGeometry(this.selectedGeometryId!, this.selectedLayer!);
      },
      () => {
          console.log('Suppression annulée');
          if (this.lastSelectedLayer) {
              this.lastSelectedLayer.setStyle({ color: 'blue' });
          }
      },
      () => this.hideFooter()
  );
}

//----------------------------------------------enquete 
showEnqueteForm() {
  this.showEnquete = true;
  this.geometrySelectedSuccess = false;
  this.showForm = true;
}
cancelEnquete() {
  this.showEnquete = false;
  this.geometrySelectedSuccess = false;
  this.showButtonsDistance=false;
}
zoomToGeometry(data: any) {
  const geometry = data.geometry;
  const address = data.address; // Assuming address is stored in data.address

  if (geometry && geometry.type === 'Feature' && geometry.geometry) {
    this.initialColor = (geometry.properties && geometry.properties.color) || 'blue'; // Utilisez la couleur de la géométrie ou la couleur par défaut
    this.showForm = false;
   
    this.activateUserLocation();

    const shape = L.geoJSON(geometry);
    shape.addTo(this.map).setStyle({color: 'red'}); // Changez la couleur pour indiquer le zoom
    this.map.fitBounds(shape.getBounds());
    this.zoomedShape = shape; 
    this.activatePlacePointMode();

    // Store the address for later use
    this.address = address;
    
    console.log('Address:', address);
  } else {
    console.error('La géométrie reçue est invalide.');
  }
}
zoomGeometry(geometry: any, address: string, id: string) {
  if (geometry && geometry.type === 'Feature' && geometry.geometry) {
    this.initialColor = (geometry.properties && geometry.properties.color) || 'blue'; // Utilisez la couleur de la géométrie ou la couleur par défaut
    this.showForm = false;
    this.geometrySelectedSuccess = false;
    this.showButtonsDistance=false;
    

    const shape = L.geoJSON(geometry);
    shape.addTo(this.map).setStyle({ color: 'red' }); // Changez la couleur pour indiquer le zoom
    this.map.fitBounds(shape.getBounds());
    this.zoomedShape = shape;
    this.activatePlacePointMode();

    // Store the address for later use
    this.address = address;
    this.addressId = id; 
    console.log('Address:', address);
    console.log('Polyline ID:', id); 
   
  } else {
    console.error('La géométrie reçue est invalide.');
  }
}


activateUserLocation() {
  this.geolocationService.getCurrentPosition().then(position => {
    if (position) {
      const userLat = position.latitude;
      const userLng = position.longitude;

      console.log('User Location:', position);

      // Zoomer et centrer la carte sur la position de l'utilisateur
      this.map.setView([userLat, userLng], 15); // 15 est un exemple de niveau de zoom

      // Montre un cercle ou un marqueur sur la position de l'utilisateur
      this.showUserCircle(userLat, userLng);
    } else {
      console.error('Invalid position object:', position);
    }
  }).catch(error => {
    console.error('Error getting user location:', error);
  });
}
showUserCircle(lat: number, lng: number) {
  if (!this.userCircle) {
    this.userCircle = L.circle([lat, lng], {
      color: 'blue',
      fillColor: '#30f',
      fillOpacity: 0.5,
      radius: 50 // Rayon du cercle en mètres
    }).addTo(this.map);
  } else {
    this.userCircle.setLatLng([lat, lng]);
  }
}
activatePlacePointMode() {//pour que user peut placer pt sur carte
  this.canPlacePoint = true;
  this.map.on('click', this.placePointOnClick.bind(this));
  
}
deactivatePlacePointMode() {
  this.canPlacePoint = false;
  this.map.off('click', this.placePointOnClick.bind(this));
  this.showForm = false;
  this.geometrySelectedSuccess = false;
  this.showButtonsDistance=false;
}
removeDrawnPoint() {
  if (this.map) {
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        this.map.removeLayer(layer);
      }
    });
  }
  if (this.initialColor && this.zoomedShape) {
    this.zoomedShape.setStyle({ color: this.initialColor });
  }
  this.deactivatePlacePointMode();
}
async placePointOnClick(e: L.LeafletMouseEvent) {
  
  if (!this.canPlacePoint) {
    return;
  }

  console.log('Point de référence :', e.latlng);
  console.log('Address:', this.address);
  this.map.eachLayer((layer) => {
    if (layer instanceof L.Circle) {
      this.map.removeLayer(layer);
    }
  });

  const circle = L.circle(e.latlng, {
    color: 'yellow',
    
    
    radius: 2
  }).addTo(this.map);

  this.referencePoint = e.latlng;

  const okHandler = async () => {
    try {
      const response = await this.recensementService.addReferencePointToPolyline(this.addressId, this.referencePoint).toPromise();
      console.log('Réponse du backend:', response);
    
      this.showButtonsDistance = true;
      this.canPlacePoint = false;
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du point de référence:', error);
      this.alertService.presentErrorAlert(
        'La voie a déjà un point de référence.',
        () => {
          this.canPlacePoint = false;
          this.removeDrawnPoint();
        },
        () => {
          console.log('Autre action effectuée.');
          this.removeDrawnPoint();
          this.recensementService.getReferencePointByAddress(this.address).subscribe(
            (response) => {
              if (response) {
                this.showReferencePointOnMap(response.lat, response.lng);
                this.showButtonsDistance = true;
              } else {
                console.log('Aucun point de référence trouvé pour cette adresse.');
              }
            },
            (error) => {
              console.error('Erreur lors de la récupération du point de référence:', error);
            }
          );
        },
        'show point'
      );
    }
  };

  const cancelHandler = () => {
    console.log('Enregistrement annulé.');
    this.removeDrawnPoint();
    this.canPlacePoint = false;
  };

  this.alertService.presentSavePointConfirmation(okHandler, cancelHandler);
}
showReferencePointOnMap(lat: number, lng: number) {
  console.log('Coordonnées du point de référence:', lat, lng);
  this.map.eachLayer((layer) => {
    if (layer instanceof L.Circle) {
      this.map.removeLayer(layer);
    }
  });

  // Ajouter un marqueur à la nouvelle position
  L.circle([lat, lng], {
    color: 'pink',
    radius: 2
  }).addTo(this.map);
}


startTracking(initialPosition: { latitude: number, longitude: number }) {
  const latLng = [initialPosition.latitude, initialPosition.longitude];
  this.userCircle = L.circle(latLng, {
    color: 'blue',
    fillColor: '#3f51b5',
    fillOpacity: 0.2,
    radius: 1
  }).addTo(this.map);
}
handlePositionUpdated(position: { latitude: number, longitude: number }) {
  const latLng = [position.latitude, position.longitude];

  if (!this.userCircle) {
    // Create the circle if it doesn't exist
    this.userCircle = L.circle(latLng, {
      color: 'blue',
      fillColor: '#3f51b5',
      fillOpacity: 0.5,
      radius: 10 // Adjust the radius as needed
    }).addTo(this.map);
  } else {
    // Update the circle's position if it already exists
    this.userCircle.setLatLng(latLng);
  }
}
handleGeometryIdFound(id: string) {
  console.log('ID de la polyline transmis depuis le composant enfant :', id);
  this.addressId = id;
}
async handleTrackingStopped() {
  await this.alertService.presentTemporaryMessage(
    "Vous avez terminé",
    "Enregistrer",
    () => { this.selectPolygonGeometry();
     
     }
  );
}
 //console.log(`Distance finale parcourue: ${this.distanceTraveled}`);
handleDistanceTraveledUpdated(distance: number): void {
  this.distanceTraveled = distance;
  console.log(`Distance parcourue: ${distance}`);
}

selectPolygonGeometry() {
  const id = this.selectedGeometryId; // recuperer id de geom selectionnee
  const address = this.address; // recuperer adresse
  
  if (id && address && this.selectedLayer instanceof L.Polygon) {
    console.log("ID du polyghhhhone sélectionné + l'adresse:", id, address);

  
    
  } else {
    console.log("Aucun polygone sélectionné ou adresse non définie.");
    console.log("Nom de la rue associée :", address); 
  }
}

addFinalAddressImmeuble(polygonId: string, adresseFinalImmeuble: string, distance: number, rive?: string, sequentialNumber?: number) {
  this.recensementService.addFinalAddressImmeuble(polygonId, adresseFinalImmeuble, distance, rive, sequentialNumber).subscribe({
    next: (response) => {
      console.log('Adresse finale ajoutée avec succès:', response);
    },
    error: (error) => {
      console.error('Erreur lors de l\'ajout de l\'adresse finale:', error);
    }
  });
}


}






