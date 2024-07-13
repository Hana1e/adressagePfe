import { Component, Input, OnInit ,Output, EventEmitter} from '@angular/core';
import { RecensementService } from 'src/app/services/recensement.service';
import * as turf from '@turf/turf';
import booleanWithin from '@turf/boolean-within';
import * as L from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { LayerManagementService } from '../map-tools/layer-management.service';
@Component({
  selector: 'app-recensement',
  templateUrl: './recensement.component.html',
  styleUrls: ['./recensement.component.scss'],
})
export class RecensementComponent implements OnInit {
  @Input() geoJSON: any;
  @Input() currentAction: 'polyline' | 'polygon' | null; // Permettre 'null' comme valeur
  @Input() enableInteraction: () => void;
  @Input()  showRecensement: boolean = true; 
  @Input() isEditFormVisible: boolean = false;
  @Input() typeGeom: 'polyline' | 'polygon' | null; 
 
  @Input() currentMode: 'recensement' | 'enquete' = 'recensement'; 
  @Input() lastDrawnItem: any; 
  @Output() resetAfterSubmission = new EventEmitter<void>();
  @Output() requestHideFooter = new EventEmitter<void>();
  @Output() cancelDrawing = new EventEmitter<void>();
  @Output() updateDetails = new EventEmitter<any>();
  @Output() showEditFormClicked = new EventEmitter<void>();
  @Output() cancelModification = new EventEmitter<void>();
  nomEntite: string = '';
  nomOfficiel:string = '';
  nomUsage:string = '';
  typedevoie: string = ''; 
  statut: string = ''; 
  numeroVoie: number;
  area: number;
  distance: number;
  @Input() selectedPolygonAttributes: any;
  selectedEntity: string;
  nomQuartier: string;
  nomImmeuble: string;
  typeImmeuble: string = '';
  Quartier: any;
  quartiers: any[] = [];
  showWarningMessage: boolean = false;
  typeQuartier: string = '';
  quartierId: string | undefined;
  nombreEtages: number | undefined;
  description: string;
  codePostal: number;
  
  
  constructor(private recensementService: RecensementService,private authService: AuthService, private layerManagementService: LayerManagementService,) {}

  ngOnInit() {
   
   
    if (this.currentAction === 'polygon') {
      this.calculateArea();
      } else if (this.currentAction === 'polyline') {
        this.calculateDistance(); // Calculer la distance si l'action en cours est 'polyline'
      }
      this.selectedEntity = '';
  }
  fetchQuartiers() {
    if (this.selectedEntity === 'immeuble') {
      this.recensementService.getQuartiers().subscribe(
        (data: any[]) => {
          this.quartiers = data;
        },
        error => {
          console.error('Failed to fetch quartiers', error);
        }
      );
    }
  }
  onSelectEntity() {
    if (this.selectedEntity === 'immeuble') {
      this.fetchQuartiers();
    }
  }
  


  calculateDistance() {
    if (this.lastDrawnItem instanceof L.Polyline) {
      this.distance = this.calculatePolylineDistance(this.lastDrawnItem);
    } else {
      console.error('Invalid polyline:', this.lastDrawnItem);
    }
  }
  calculatePolylineDistance(polyline: L.Polyline): number {
    const latlngs = polyline.getLatLngs() as L.LatLng[];
    let distance = 0;
    for (let i = 0; i < latlngs.length - 1; i++) {
      distance += latlngs[i].distanceTo(latlngs[i + 1]);
    }
    return distance;
  }

  calculateArea() {
    const geoJSON = this.lastDrawnItem.toGeoJSON();
    if (geoJSON && geoJSON.geometry && geoJSON.geometry.type === 'Polygon' && geoJSON.geometry.coordinates.length > 0) {
      const area = turf.area(geoJSON.geometry);
      this.area = area; // Enregistrer l'aire
    } else {
      console.error('Invalid geometry for area calculation:', geoJSON);
    }
  }
  
  capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  formatNumeroVoie(numeroVoie: number): string {
    // Ajoutez un zéro devant si le numéro de voie est un seul chiffre
    return numeroVoie < 10 ? `0${numeroVoie}` : `${numeroVoie}`;
  }
  
  async submitPolylineData() {
    const userId = this.authService.getUserId()!;
    const hasIntersection = await this.checkIntersectionWithQuartier();

    if (hasIntersection) {
        const distanceWithUnit = `${this.distance.toFixed(2)} m`;
        const numeroVoieFormatte = this.numeroVoie ? this.formatNumeroVoie(this.numeroVoie) : ''; // Vérifie si numeroVoie est défini
        const capitalizedNomOfficiel = this.nomOfficiel.toUpperCase();
        console.log("La polyline est entièrement à l'intérieur du quartier:", this.nomQuartier);
        
        // Assurez-vous que quartierId est une chaîne vide si non défini
        const quartierId = this.quartierId ? this.quartierId : '';

        // Construire l'adresse
        let adresse = `${this.typedevoie} ${capitalizedNomOfficiel}`;
        if (numeroVoieFormatte) {
            adresse += ` ${numeroVoieFormatte}`;
        }

        this.recensementService.sendPolylineData(
            this.geoJSON,
            capitalizedNomOfficiel,
            this.nomUsage,
            this.typedevoie,
            numeroVoieFormatte,
            this.statut,
            userId,
            distanceWithUnit,
            this.nomQuartier,
            quartierId, // Passer l'ID du quartier à la méthode sendPolylineData
            adresse // Ajouter l'adresse
        ).subscribe({
            next: (response) => {
                console.log('Data submitted successfully', response);
                if (this.lastDrawnItem) {
                    this.lastDrawnItem.options.customId = response._id;
                }
                this.updateDetails.emit({ id: response._id, item: this.lastDrawnItem });
                this.requestHideFooter.emit();
                this.resetAfterSubmission.emit();
            },
            error: (error) => {
                console.error('Failed to submit data', error);
            }
        });
    } else {
        console.log("Pas d'intersection avec un quartier de la base de données. Le polyline ne sera pas soumis.");
        // Vous pouvez ajouter ici une notification ou un message à l'utilisateur
    }
}


submitPolygonData() {
  const userId = this.authService.getUserId()!;
  this.calculateArea();
  const areaWithUnit = `${this.area.toFixed(2)} m²`;

  let nomEntite: string = '';
  let typeImmeuble: string | undefined;
  let nomImmeuble: string | undefined;
  let nomQuartier: string | undefined;
  let Quartier: string | undefined;
  let typeQuartier: string | undefined;
  let nombreEtages: number | undefined;
  let description: string | undefined; 
  let adresseImmeuble: string | undefined;
  let codePostal: number | undefined;
  let codePostalQuartier: number | undefined;
  if (this.selectedEntity === 'quartier') {
    nomEntite = 'quartier';
    nomQuartier = this.nomQuartier; 
    typeQuartier = this.typeQuartier;
    description = this.description;
    codePostal = this.codePostal;
  } else if (this.selectedEntity === 'immeuble') {
    nomEntite = 'immeuble';
    typeImmeuble = this.typeImmeuble;
    nomImmeuble = this.nomImmeuble;
    Quartier = this.Quartier;
    nombreEtages = this.nombreEtages;
    description = this.description;
    adresseImmeuble = `${typeImmeuble} ${nomImmeuble}`;
    if (this.selectedEntity === 'immeuble') {
      const quartierId = this.Quartier; 
      this.recensementService.getCodePostalQuartier(quartierId).subscribe({
        next: (codePostal) => {
          codePostalQuartier = codePostal;
        },
        error: (error) => {
          console.error('Failed to fetch postal code for quartier:', error);
        }
      });
    }
  }

  this.recensementService.getCoucheAttribuee().subscribe({
    next: (data) => {
      const layerId = data.layerId;
      if (!layerId) {
        console.error('ID de la couche non défini');
        return;
      }

      this.recensementService.sendPolygonData(
        this.geoJSON,
        nomEntite,
        userId,
        areaWithUnit,
        layerId, 
        this.nomQuartier,
        typeImmeuble, 
        nomImmeuble,
        Quartier,
        typeQuartier,
        nombreEtages,
        description,
        adresseImmeuble,
        codePostal,
        codePostalQuartier,
      ).subscribe({
        next: (response) => {
          console.log('Data submitted successfully', response);
          if (this.lastDrawnItem) {
            this.lastDrawnItem.options.customId = response._id;
            if (this.selectedEntity === 'quartier') {
              this.lastDrawnItem.setStyle({ color: 'orange' });
            }
          }
          this.updateDetails.emit({ id: response._id, item: this.lastDrawnItem });
          this.requestHideFooter.emit();
          this.resetAfterSubmission.emit();
        },
        error: (error) => {
          console.error('Failed to submit data', error);
        }
      });
    },
    error: (err) => {
      console.error('Erreur lors de la récupération de l\'ID de la couche', err);
    }
  });
}

  
 
  
  

  
  
  
  submitData() {
    if (this.currentAction === 'polygon' && this.selectedEntity === 'immeuble' && !this.Quartier) {
      this.showWarningMessage = true; // Afficher le message d'avertissement
      return; // Arrêter l'exécution de la méthode
    }
    if (this.currentAction === 'polyline') {
      this.submitPolylineData();
    } else if (this.currentAction === 'polygon') {
      this.submitPolygonData();
    }
  }
  
  modifyData(){}
  

  cancelData(){
    this.cancelDrawing.emit(); 
    this. showRecensement = false;
  }
  cancelModify(){
    this.isEditFormVisible= false;
    this.requestHideFooter.emit();
    this.cancelModification.emit();
  }
  async checkIntersectionWithQuartier() {
    const quartiers = await this.recensementService.getQuartierGeometries().toPromise();
    if (quartiers && quartiers.length > 0) {
        const polylineGeoJSON = this.lastDrawnItem.toGeoJSON();
        const polyline = turf.lineString(polylineGeoJSON.geometry.coordinates);
        for (const quartier of quartiers) {
          if (quartier && quartier._id) { // Vérifier si quartier est défini et a une propriété _id
              const quartierPolygon = turf.polygon(quartier.geoJSON.geometry.coordinates);
              const within = booleanWithin(polyline, quartierPolygon);
              if (within) {
                  console.log('La polyline est entièrement à l\'intérieur du quartier:', quartier.nomQuartier);
                  this.nomQuartier = quartier.nomQuartier; // Enregistrez le nom du quartier
                  this.quartierId = quartier._id; // Enregistrez l'ID du quartier
                  console.log('id de quartier:', quartier._id);
                  return true; // La polyline est entièrement à l'intérieur du quartier
              }
          }
      }
      
    }
    console.log('La polyline n\'est pas entièrement à l\'intérieur d\'un quartier de la base de données');
    return false; // La polyline n'est pas entièrement à l'intérieur d'un quartier
}





  
}