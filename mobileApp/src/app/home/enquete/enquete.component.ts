import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RecensementService } from 'src/app/services/recensement.service';
import { GeolocationService } from '../map-tools/geolocation.service';
import { AlertService } from '../map-tools/alert.service';

@Component({
  selector: 'app-enquete',
  templateUrl: './enquete.component.html',
  styleUrls: ['./enquete.component.scss'],
})
export class EnqueteComponent implements OnInit {
  addresses: string[] = [];
  selectedAddress: string = '';
  selectedLayerId: string = '';
  @Input() showEnquete: boolean = true; 
  @Input() currentMode: 'recensement' | 'enquete' = 'enquete';
  @Input() showForm: boolean = true;
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() geometrySelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelDrawing: EventEmitter<void> = new EventEmitter<void>();
  @Input() selectedGeometryId: string | null = null;
  @Input() geometrySelectedSuccess: boolean = false;
  showReferencePoint: boolean = false;
  referencePoint: any = null;
  @Output() placePointOnMap: EventEmitter<any> = new EventEmitter<any>();
  @Output() geometryIdFound: EventEmitter<string> = new EventEmitter<string>();
  @Input() initialGeometryColor: string;
  trackingWatchId: any;
  initialPosition: { latitude: number, longitude: number } | null = null;
  distanceTraveled: number = 0;
  userCircle: L.Circle | null = null;
  showSaveButton: boolean = false;
  @Output() positionUpdated: EventEmitter<{ latitude: number, longitude: number }> = new EventEmitter();
  @Output() trackingStopped: EventEmitter<void> = new EventEmitter<void>();
  @Output() distanceTraveledUpdated: EventEmitter<number> = new EventEmitter<number>();
  @Output() startTrackingEvent: EventEmitter<{ latitude: number, longitude: number }> = new EventEmitter();
  @Output() commencerClicked = new EventEmitter<void>();
  @Output() stop= new EventEmitter<void>();
  @Output() stopClicked = new EventEmitter<void>();
  //showButtons: boolean = true;
  @Input() showButtonsDistance: boolean = false;
  predefinedPath: { latitude: number, longitude: number }[] = [
    { latitude: 35.72384, longitude: -5.89662},
    { latitude: 35.72370, longitude: -5.89649 },
    { latitude: 35.72639, longitude: -5.89639},
    { latitude: 35.72322, longitude: -5.89595},
  ];


  constructor(private recensementService: RecensementService, private geolocationService: GeolocationService, private alertService: AlertService) { }

  ngOnInit() {
    this.getAllAddresses();
  }
  // Dans EnqueteComponent
commencer(event: MouseEvent | undefined) {
    if (event) {
      event.stopPropagation(); 
    }
    this.commencerClicked.emit(); 
  }
  afficherBoutons() {
    this.showButtonsDistance = true;
  }

  arreter() {
    this.stop.emit();
    this.showButtonsDistance = false;
  }
  cancelData() {
    this.cancel.emit();
    this.cancelDrawing.emit();
    this.showForm = false;
  }

  cancelOrStopTracking() {
    this.cancelData();
    this.stopTracking();
  }

  getAllAddresses() {
    this.recensementService.getAllAddresses().subscribe(addresses => {
      this.addresses = addresses;
    });
  }

  zoomToPolyline() {
    if (!this.selectedAddress) {
      return;
    }
    this.getGeometryId(this.selectedAddress);
    this.recensementService.getAddressGeometry(this.selectedAddress).subscribe(response => {
      const geometry = response?.geoJSON;
      if (geometry) {
        const data = { address: this.selectedAddress, geometry: geometry };
        this.geometrySelected.emit(data);
        this.zoomToGeometry(data);
        this.showReferencePoint = true;
        this.geometrySelectedSuccess = false;
      } else {
        console.error('La réponse ne contient pas de géométrie valide.');
        this.geometrySelectedSuccess = false;
      }
    });
  }

  zoomToGeometry(geometry: any) {
    console.log('Zoom to geometry:', geometry);
  }

  getGeometryId(address: string) {
    this.recensementService.getAddressGeometry(address).subscribe(response => {
      const geometry = response?.geoJSON;
      const id = response?.id;
      if (geometry && id) {
        console.log('ID de la géométrie pour l\'adresse', address, ':', id);
        this.geometryIdFound.emit(id);
      } else {
        console.error('La réponse ne contient pas de géométrie valide.');
      }
    });
  }

  simulateMovement() {
    let currentIndex = 0;
    this.distanceTraveled = 0;
    this.initialPosition = null;

    const move = () => {
      if (currentIndex >= this.predefinedPath.length) {
        this.stopTracking();
        return;
      }

      const position = this.predefinedPath[currentIndex];

      if (!this.initialPosition) {
        this.initialPosition = position;
      } else {
        this.distanceTraveled += this.calculateDistance(this.initialPosition, position);
        this.initialPosition = position;
      }

      // Emit the position to the parent component
      this.positionUpdated.emit(position);

      // Emit the distance traveled
      this.distanceTraveledUpdated.emit(this.distanceTraveled);

      currentIndex++;
      setTimeout(move, 2000); 
    };

    move();
  }

  startTracking() {
    if (this.predefinedPath.length > 0) {
      this.startTrackingEvent.emit(this.predefinedPath[0]); // Emit the initial position
      this.simulateMovement();
    }
  }


  stopTracking() {
    this.trackingWatchId = null;
    console.log('Simulation of movement stopped.');
    this.trackingStopped.emit();
  }

  calculateDistance(start: { latitude: number, longitude: number }, end: { latitude: number, longitude: number }): number {
    const R = 6371e3; // metres
    const φ1 = start.latitude * Math.PI / 180; // φ, λ in radians
    const φ2 = end.latitude * Math.PI / 180;
    const Δφ = (end.latitude - start.latitude) * Math.PI / 180;
    const Δλ = (end.longitude - start.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return Math.round(d);
  }
}
