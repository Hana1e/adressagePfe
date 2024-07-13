import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { throwError, fromEvent, of } from 'rxjs';
import { CoordinatesService } from 'src/app/shared/services/coordinates.service';
import { BackendService } from 'src/app/shared/services/backend.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
 
  map: any;
  searchResults: string[] = [];
  error: string = '';
  currentGeoJSONLayer: any;
  searchInputValue: string = '';
  currentMarker: L.Marker | null = null;
  coordinatesReceived: boolean = false;
  constructor(private http: HttpClient,private coordinatesService: CoordinatesService,private backendService: BackendService) {}

  ngOnInit(): void {
    this.initMap();
    this.setupSearch();
    this.coordinatesService.coordinates$.subscribe(coordinates => {
      this.onSearchByCoordinates(coordinates);
    });
  }

  initMap(): void {
    this.map = L.map('map', {
      attributionControl: false // Désactiver l'attribution Leaflet
    }).setView([35.759465, -5.833954], 13); 
  
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {}).addTo(this.map);
    L.Icon.Default.prototype.options.shadowUrl = '';
    L.control.scale({ metric: true, imperial: false }).addTo(this.map);
  }
  setupSearch(): void {
    fromEvent<Event>(this.searchInput.nativeElement, 'input')
      .pipe(
        debounceTime(300), // Attendre 300ms après le dernier événement avant de procéder
        distinctUntilChanged(), // Ignorer les changements si la valeur est la même que la précédente
        map((event: Event) => (event.target as HTMLInputElement).value), // Extraire la valeur de l'entrée
        switchMap((query: string) => this.search(query))
      )
      .subscribe(
        (results: string[]) => {
          this.searchResults = results;
          this.error = '';
        },
        (error) => {
          this.error = 'Error fetching search results: ' + error.message;
          console.error('Error fetching search results:', error);
        }
      );
  }
  search(query: string) {
    if (query.trim().length > 0) {
      return this.http.get<string[]>(`http://localhost:3000/recensement/polyline/search/${query}`)
        .pipe(
          switchMap((addressResults: string[]) => {
            return this.http.get<string[]>(`http://localhost:3000/recensement/entities/search/${query}`)
              .pipe(
                catchError((error) => {
                  this.error = 'Error fetching search results: ' + error.message;
                  console.error('Error fetching search results:', error);
                  return throwError(error);
                }),
                map((quartierResults: string[]) => {
                  // Combiner et trier les résultats
                  const filteredAddressResults = addressResults.filter(result => result.toLowerCase().includes(query.toLowerCase()));
                  const filteredQuartierResults = quartierResults.filter(result => result.toLowerCase().includes(query.toLowerCase()));
                  const combinedResults = [...filteredAddressResults, ...filteredQuartierResults];

                  // Trier les résultats : ceux qui commencent par la lettre en premier, puis par ordre alphabétique
                  return combinedResults.sort((a, b) => {
                    if (a.toLowerCase().startsWith(query.toLowerCase()) && !b.toLowerCase().startsWith(query.toLowerCase())) {
                      return -1;
                    }
                    if (!a.toLowerCase().startsWith(query.toLowerCase()) && b.toLowerCase().startsWith(query.toLowerCase())) {
                      return 1;
                    }
                    return a.localeCompare(b);
                  });
                })
              );
          }),
          catchError((error) => {
            this.error = 'Error fetching search results: ' + error.message;
            console.error('Error fetching search results:', error);
            return throwError(error);
          })
        );
    } else {
      return of([]); // Retourner un tableau vide si la requête est vide
    }
  }
  focusOnSuggestion(suggestion: string, searchInput: HTMLInputElement): void {
    // Si la suggestion contient des chiffres, elle est considérée comme une adresse
    if (/\d/.test(suggestion)) {
      this.focusOnAddress(suggestion, searchInput);
    } else if (suggestion.startsWith('Hay')) {
      // Si la suggestion commence par "Hay", considérez-la comme un quartier
      this.focusOnQuartier(suggestion, searchInput);
    } else {
      // Sinon, considérez-la comme un immeuble
      this.focusOnImmeuble(suggestion, searchInput);
    }
  }
  focusOnAddress(adresse: string, searchInput: HTMLInputElement): void {
    console.log('Address clicked:', adresse);
    this.searchInputValue = adresse;
    searchInput.value = adresse;
    this.http.get<any>(`http://localhost:3000/recensement/polyline/geometry/${adresse}`)
      .pipe(
        catchError((error) => {
          this.error = 'Error fetching geometry: ' + error.message;
          console.error('Error fetching geometry:', error);
          return throwError(error);
        })
      )
      .subscribe(
        (geometry) => {
          console.log('Geometry data:', geometry);
          if (geometry && geometry.geometry && geometry.geometry.coordinates) {
            if (this.currentGeoJSONLayer) {
              this.map.removeLayer(this.currentGeoJSONLayer);
            }
            this.currentGeoJSONLayer = L.geoJSON(geometry).addTo(this.map);
            this.map.fitBounds(this.currentGeoJSONLayer.getBounds());
            // Ajouter l'étiquette de la voie
            this.addVoieLabel(adresse, this.currentGeoJSONLayer.getBounds().getCenter());
          }
        },
        (error) => {
          console.error('Error fetching geometry:', error);
          this.error = 'Error fetching geometry: ' + error.message;
        }
      );
  
    this.searchResults = [];
  }
  focusOnQuartier(nomQuartier: string, searchInput: HTMLInputElement): void {
    console.log('Quartier clicked:', nomQuartier);
    this.searchInputValue = nomQuartier;
    searchInput.value = nomQuartier;
    this.http.get<any>(`http://localhost:3000/recensement/quartiers/geometry/${nomQuartier}`)
      .pipe(
        catchError((error) => {
          this.error = 'Error fetching geometry: ' + error.message;
          console.error('Error fetching geometry:', error);
          return throwError(error);
        })
      )
      .subscribe(
        (geometry) => {
          console.log('Geometry data:', geometry);
          if (geometry && geometry.geometry && geometry.geometry.coordinates) {
            if (this.currentGeoJSONLayer) {
              this.map.removeLayer(this.currentGeoJSONLayer);
            }
            this.currentGeoJSONLayer = L.geoJSON(geometry, {
              style: {
                fillColor: 'red', // Intérieur rouge
                color: 'red', // Bordure rouge
                weight: 2 // Épaisseur de la bordure
              }
            }).addTo(this.map);
            this.map.fitBounds(this.currentGeoJSONLayer.getBounds());
            // Ajouter l'étiquette du quartier
            this.addQuartierLabel(nomQuartier, this.currentGeoJSONLayer.getBounds().getCenter());
          }
        },
        (error) => {
          console.error('Error fetching geometry:', error);
          this.error = 'Error fetching geometry: ' + error.message;
        }
      ); // <-- Ajout de la parenthèse manquante ici

    this.searchResults = [];
  }
  focusOnImmeuble(adresseImmeuble: string, searchInput: HTMLInputElement): void {
    console.log('Immeuble clicked:', adresseImmeuble);
    this.searchInputValue = adresseImmeuble;
    searchInput.value = adresseImmeuble;
    this.http.get<any>(`http://localhost:3000/recensement/immeubles/geometry/${adresseImmeuble}`)
      .pipe(
        catchError((error) => {
          this.error = 'Error fetching geometry: ' + error.message;
          console.error('Error fetching geometry:', error);
          return throwError(error);
        })
      )
      .subscribe(
        (geometry) => {
          console.log('Geometry data:', geometry);
          if (geometry && geometry.geometry && geometry.geometry.coordinates) {
            if (this.currentGeoJSONLayer) {
              this.map.removeLayer(this.currentGeoJSONLayer);
            }
            this.currentGeoJSONLayer = L.geoJSON(geometry, {
              style: {
                fillColor: 'blue', // Intérieur bleu pour les immeubles
                color: 'blue', // Bordure bleue
                weight: 2 // Épaisseur de la bordure
              }
            }).addTo(this.map);
            this.map.fitBounds(this.currentGeoJSONLayer.getBounds());
            // Ajouter l'étiquette de l'immeuble
            this.addImmeubleLabel(adresseImmeuble, this.currentGeoJSONLayer.getBounds().getCenter());
          }
        },
        (error) => {
          console.error('Error fetching geometry:', error);
          this.error = 'Error fetching geometry: ' + error.message;
        }
      );
    
    this.searchResults = [];
  }
  addVoieLabel(adresse: string, center: L.LatLng): void {
    const popupContent = `<div class="popup-content">${adresse}</div>`;
  
    const popup = L.popup({
      closeButton: false, 
      autoClose: false
    })
    .setContent(popupContent)
    .setLatLng(center)
    .openOn(this.map);
  }
  addQuartierLabel(nomQuartier: string, center: L.LatLng): void {
    const popupContent = `<div class="popup-content">${nomQuartier}</div>`;

    const popup = L.popup({
      closeButton: false, // Désactive le bouton de fermeture du pop-up
      autoClose: false // Empêche le pop-up de se fermer automatiquement
    })
    .setContent(popupContent)
    .setLatLng(center)
    .openOn(this.map);
  }
  addImmeubleLabel(adresseImmeuble: string, center: L.LatLng): void {
    const popupContent = `<div class="popup-content">${adresseImmeuble}</div>`;
  
    const popup = L.popup({
      closeButton: false,
      autoClose: false
    })
    .setContent(popupContent)
    .setLatLng(center)
    .openOn(this.map);
  }
  resetMap(): void {
    if (this.currentGeoJSONLayer) {
      // Fermer tous les pop-ups
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Popup) {
          layer.closePopup();
        }
      });

      // Supprimer les étiquettes de quartier
      this.removeQuartierLabels();

      this.map.removeLayer(this.currentGeoJSONLayer);
      this.currentGeoJSONLayer = null;
      this.map.setView([35.759465, -5.833954], 13);
      this.searchResults = [];
    }
    this.searchInputValue = '';
    this.searchInput.nativeElement.value = '';
  }
  removeQuartierLabels(): void {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer.options.icon && layer.options.icon.options.className === 'quartier-label') {
        this.map.removeLayer(layer);
      }
    });
  }

  onSearchByCoordinates(coordinates: { lat: number, lng: number }) {
    console.log('Coordinates received:', coordinates);
    const { lat, lng } = coordinates;

    // Supprimez le marqueur précédent s'il existe
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }

    // Créez un nouveau marqueur à partir des coordonnées reçues
    this.currentMarker = L.marker([lat, lng]);

    // Ajoutez le marqueur à la carte
    if (this.coordinatesReceived) {
      this.currentMarker.addTo(this.map);
    }

    // Définissez la vue de la carte sur les nouvelles coordonnées
    this.map.setView([lat, lng], 13);
    this.coordinatesReceived = true;

    // Appelez le service pour vérifier l'intersection avec un immeuble
    this.backendService.checkIntersection(lat, lng).subscribe(
      (response: { adresseImmeuble: string }) => {
        if (response.adresseImmeuble) {
          // Affichez un popup contenant l'adresse de l'immeuble si une intersection est trouvée
          const popup = L.popup()
            .setLatLng([lat, lng])
            .setContent(` ${response.adresseImmeuble}`)
            .openOn(this.map);
        } else {
          // Si aucune intersection avec un immeuble n'est trouvée, vérifiez l'intersection avec une polyline
          this.backendService.checkIntersectionPolyline(lat, lng).subscribe(
            (response: { adresse?: string }) => {
              if (response.adresse) {
                // Affichez un popup contenant l'adresse si une intersection avec une polyline est trouvée
                const popup = L.popup()
                  .setLatLng([lat, lng])
                  .setContent(response.adresse)
                  .openOn(this.map);
              } else {
                console.log('No intersection with polyline found');
              }
            },
            (error) => {
              console.error('Failed to check intersection with polyline', error);
            }
          );
        }
      },
      (error) => {
        console.error('Failed to check intersection with building', error);
      }
    );
  }
  onSearch(): void {
    const input = this.searchInput.nativeElement as HTMLInputElement;
    const value = input.value.trim();
    const [lat, lng] = value.split(',').map(coord => parseFloat(coord.trim()));

    if (!isNaN(lat) && !isNaN(lng)) {
      console.log('Coordinates received:', { lat, lng });

      // Supprimez le marqueur précédent s'il existe
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }

      // Créez un nouveau marqueur à partir des coordonnées reçues
      this.currentMarker = L.marker([lat, lng]).addTo(this.map);

      // Définissez la vue de la carte sur les nouvelles coordonnées
      this.map.setView([lat, lng], 13);

      // Appelez le service pour vérifier l'intersection avec un immeuble
      this.backendService.checkIntersection(lat, lng).subscribe(
        (response: { adresseImmeuble: string }) => {
          if (response.adresseImmeuble) {
            // Affichez un popup contenant l'adresse de l'immeuble si une intersection est trouvée
            L.popup()
              .setLatLng([lat, lng])
              .setContent(` ${response.adresseImmeuble}`)
              .openOn(this.map);
          } else {
            // Si aucune intersection avec un immeuble n'est trouvée, vérifiez l'intersection avec une polyline
            this.backendService.checkIntersectionPolyline(lat, lng).subscribe(
              (response: { adresse?: string }) => {
                if (response.adresse) {
                  // Affichez un popup contenant l'adresse si une intersection avec une polyline est trouvée
                  L.popup()
                    .setLatLng([lat, lng])
                    .setContent(response.adresse)
                    .openOn(this.map);
                } else {
                  console.log('No intersection with polyline found');
                }
              },
              (error) => {
                console.error('Failed to check intersection with polyline', error);
              }
            );
          }
        },
        (error) => {
          console.error('Failed to check intersection with building', error);
        }
      );
    } else {
      alert('Veuillez entrer des coordonnées valides (Latitude, Longitude).');
    }
  }
}
