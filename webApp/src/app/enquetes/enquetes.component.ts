import { Component, OnInit } from '@angular/core';
import { EnqueteService } from '../services/enquete.service';
import { UserService } from '../services/user.service';
import { GeoDataService } from '../services/GeoData.service';
import { NgForm } from '@angular/forms';
import jsPDF from 'jspdf';
import { PdfService } from '../services/pdf.service';
import { forkJoin } from 'rxjs';
import { PdfGeneratorService } from './PdfGenerator.Service';

@Component({
  selector: 'app-enquetes',
  templateUrl: './enquetes.component.html',
  styleUrls: ['./enquetes.component.scss']
})
export class EnquetesComponent implements OnInit {
  enqueteurs: any[] = [];
  enquetes: any[] = []; 
  layers: any[] = []; 
  showForm: boolean = false;
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false; 
  errorMessage: string = '';
  formError: string = '';
  selectedEnqueteurId: string = '';
  selectedLayerId: string = '';
  selectedType: string = '';
  selectedDate: string = '';
  selectedLayerName: string = '';
  quartiers: any[] = [];
  constructor(private enqueteService: EnqueteService,private userService: UserService, 
    private geoDataService: GeoDataService,private pdfGeneratorService: PdfGeneratorService) {}
  ngOnInit() {
    this.loadEnqueteurs();
    this.loadLayers(); 
    this.loadEnquetes(); 
  }
  loadEnquetes() {
    this.enqueteService.getEnquetes().subscribe({
      next: (enquetes) => {
        this.enquetes = enquetes;
        console.log('Enquêtes loaded:', this.enquetes);
      },
      error: (error) => {
        console.error('Error loading enquetes', error);
        this.showErrorMessage = true;
      }
    });
  }
  loadLayers() {
    this.geoDataService.getAllLayers().subscribe({
      next: (response) => {
        this.layers = response.data.map(layer => ({
          ...layer,
          layerName: this.extractLayerName(layer.layerName)  
        }));
        console.log("Updated layers to display:", this.layers);
      },
      error: (error) => console.error('Error loading layers', error)
    });
  }
  
  extractLayerName(fullPath: string): string {
    const parts = fullPath.split('/');
    return parts.pop() || '';  
  }
  
  loadEnqueteurs() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users Loaded:', users);  
        this.enqueteurs = users.filter(user => user.role.toLowerCase() === 'enqueteur');
        console.log('Filtered Enqueteurs:', this.enqueteurs);  
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enquêteurs', error);
      }
    });
  }
  onEnqueteurChange(event: any) {
    const selectedId = event.target.value;
    console.log('Selected enquêteur ID:', selectedId);
  }
  onLayerChange(event: any) {
    const selectedId = event.target.value;
    console.log('Selected layer ID:', selectedId);
  }
  
  toggleForm() {
    this.showForm = !this.showForm;
  }

  closeForm() {
    this.showForm = false;
  }
  isLayerAssigned(layerId: string): boolean {
    return this.enquetes.some(enquete => enquete.layerId === layerId);
}
  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.isLayerAssigned(this.selectedLayerId)) {
        this.errorMessage = 'Cette zone est déjà attribuée. Veuillez choisir une autre zone.';
        return;
    }
      const enqueteData = {
        enqueteurId: this.selectedEnqueteurId,
        enqueteurName: this.enqueteurs.find(e => e._id === this.selectedEnqueteurId)?.name,
        layerId: this.selectedLayerId,
        layerName: this.selectedLayerName,
        type: this.selectedType,
        dateAttribution: this.selectedDate
      };
  
      this.enqueteService.createEnquete(enqueteData).subscribe({
        next: (response) => {
          this.enquetes.push(response);
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.closeForm();
        }, 3000);
        },
        error: (error: Error) => {
          console.error('Error creating enquête:', error.message);
          this.errorMessage = error.message;
        }
      });
    } else {
      this.formError = 'Veuillez remplir tous les champs requis.';
  }
  }

  
  deleteEnquete(id: string): void {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette enquête ?")) {
      this.enqueteService.deleteEnquete(id).subscribe({
        next: () => {
          console.log('Enquête supprimée avec succès');
          this.enquetes = this.enquetes.filter(enquete => enquete._id !== id);
        },
        error: error => {
          console.error('Erreur lors de la suppression de l\'enquête', error);
        }
      });
    } else {
      console.log('Suppression annulée');
    }
  }
  

 
  downloadPDF(enqueteurId: string, enqueteurName: string, layerName: string) {
    this.pdfGeneratorService.generateAndDownloadPDF(enqueteurId, enqueteurName, layerName);
  }
  
  



  
  
}
