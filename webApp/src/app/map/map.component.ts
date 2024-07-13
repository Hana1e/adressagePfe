import { Component, AfterViewInit } from '@angular/core';
import L from 'leaflet';
import JSZip from 'jszip';

import { DrawPluginService } from './services/draw-plugin';
import { ImportCoucheService } from './services/importCouche';
import { HttpEventType } from '@angular/common/http';
import { MapLayerService } from './services/MapLayer';
import 'leaflet-fullscreen';
import 'leaflet-draw';
import { GeoDataService } from '../services/GeoData.service';
import { LayerDisplayService } from './services/layerDisplay';
import { GeometryService } from '../services/geometry.service';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  private map: L.Map;
  layerName: string;
  zipFile: File | null = null;
  errorMessage: string = '';
  showForm: boolean = false;
  showLayerName: boolean = false;
  showLayerForm: boolean = false;
  private tiles: L.TileLayer[];
  private currentTileIndex = 0;
  layersLegend: { name: string, color: string }[] = [];
  legendVisible: boolean = false;
  private mapLayers: L.Layer[] = [];
  layers: any[] = [];
  allLayers: any[] = [];
  selectedLayers: string[] = [];
  successMessage: string = '';
  progress: number = 0;
  loading: boolean = false;
  layersLoaded: boolean = false;
  private currentLayer: L.Layer; 
  

  constructor(private importCoucheService: ImportCoucheService,
              private drawPluginService: DrawPluginService,
              private geoDataService: GeoDataService,
              private mapLayerService: MapLayerService,
              private layerDisplayService: LayerDisplayService,
              private geometryService: GeometryService
              ) { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [	35.7054, -5.8864],
      zoom: 13,
      attributionControl: false
    });
    this.mapLayerService.initializeMap(this.map);
    this.tiles = [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 3,
      }),
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: '© <a href="https://www.arcgis.com/">ArcGIS</a> contributors'
  })
    ];

    this.tiles[this.currentTileIndex].addTo(this.map);

    
    L.control.scale({ metric: true, imperial: false }).addTo(this.map);
    L.control.fullscreen().addTo(this.map);
    this.drawPluginService.drawPlugin(this.map);
    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      this.showLayerName = true;  // Afficher le formulaire
      this.currentLayer = layer;  // Sauvegarder la couche actuelle pour l'utiliser plus tard
      this.map.addLayer(layer);
    });
    
  }
  

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.errorMessage = '';   
      this.successMessage = ''; 
    }
  }
  closeForm() {
    this.showForm = false;
    this.showLayerName = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  toggleLayerForm(): void {
    this.showLayerForm = !this.showLayerForm;
    if (this.showLayerForm) {
      this.loadAllLayers();  // Charger les couches quand le formulaire est affiché
    }}
  closeLayerForm() {
    this.showLayerForm = false;}

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      this.validateZipContents(file).then(isValid => {
        if (isValid) {
          this.zipFile = file;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Le fichier ZIP ne contient pas les types de fichiers nécessaires (GeoJSON ou SHP).';
          this.zipFile = null;
        }
      }).catch(error => {
        console.error('Error reading ZIP:', error);
        this.errorMessage = 'Erreur lors de la lecture du fichier ZIP.';
        this.zipFile = null;
      });
    } else {
      this.errorMessage = 'Veuillez sélectionner un fichier ZIP valide.';
      this.zipFile = null;
    }
  }
  
  async validateZipContents(file: File): Promise<boolean> {
    const zip = new JSZip();
    const content = await zip.loadAsync(file);
    let containsValidFiles = false;
    
    content.forEach((relativePath, zipEntry) => {
      if (relativePath.endsWith('.geojson') || relativePath.endsWith('.shp')) {
        containsValidFiles = true;
      }
    });
  
    return containsValidFiles;
  }
  
  changeMapBackground(): void {
    this.tiles.forEach(tile => this.map.removeLayer(tile));
    this.currentTileIndex = (this.currentTileIndex + 1) % this.tiles.length;
    this.tiles[this.currentTileIndex].addTo(this.map);
}
submitFile(): void {
  if (this.zipFile) {
    this.loading = true; // Optionnel: gérer un état de chargement
    this.geoDataService.uploadZipFile(this.zipFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          console.log(`File is ${percentDone}% uploaded.`);
        } else if (event.type === HttpEventType.Response) {
          console.log('Upload complete');
          this.successMessage = 'Fichier envoyé avec succès !'; // Définir le message de succès
          this.errorMessage = ''; // Assurez-vous de réinitialiser les erreurs précédentes
         
        }
      },
      
    });
  } 
}
loadLayers(): void {
  this.mapLayerService.loadLayers();
}
loadAllLayers(): void {
  this.loading = true; // Begin showing a loading indicator.
  this.progress = 0; // Reset progress

  this.geoDataService.getAllLayers().subscribe({
    next: (layers) => {
      this.allLayers = layers.data; 
      this.progress = 100; 
      this.loading = false; 
    },
    error: (error) => {
      console.error('Failed to load layers', error); 
      this.progress = 0; // Reset progress on error.
      this.loading = false; // Hide loading indicator.
    }
  });
}
handleLayerSelection(event: Event): void {
  this.layerDisplayService.displaySelectedLayers(event, this.map);
}
saveLayerName(): void {
  if (this.currentLayer && this.layerName) {
    // Convert Leaflet layer to GeoJSON
    const geoJson = this.currentLayer.toGeoJSON();
    
    // Prepare the data object correctly named as per backend schema
    const data = {
      geoJSON: geoJson,  // Change 'geometry' to 'geoJSON'
      layerName: this.layerName
    };

    // Log to confirm what's being sent
    console.log('Data being sent:', data);

    // Call the service to save the geometry
    this.geometryService.saveGeometry(data).subscribe({
      next: (response) => {
        console.log('Geometry saved successfully', response);
        this.successMessage = 'Geometry saved successfully!';
      },
      error: (error) => {
        console.error('Failed to save geometry', error);
        this.errorMessage = 'Failed to save geometry.';
      }
    });

    // Reset UI and close the modal
    this.layerName = '';
    this.showLayerName = false;
  } else {
    this.errorMessage = 'No layer or name provided.';
  }
}


}







   

