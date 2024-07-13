import { Component, NgModule, Output, Input, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { DxTreeViewModule, DxTreeViewComponent, DxTreeViewTypes } from 'devextreme-angular/ui/tree-view';
//import { navigation } from '../../../app-navigation';
import * as events from 'devextreme/events';
import { CommonModule } from '@angular/common';
import { CoordinatesService } from '../../services/coordinates.service';

@Component({
  selector: 'app-side-navigation-menu',
  templateUrl: './side-navigation-menu.component.html',
  styleUrls: ['./side-navigation-menu.component.scss']
})
export class SideNavigationMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DxTreeViewComponent, { static: true })
  menu!: DxTreeViewComponent;

  @Output()
  selectedItemChanged = new EventEmitter<DxTreeViewTypes.ItemClickEvent>();

  @Output()
  openMenu = new EventEmitter<any>();



  private _selectedItem!: string;
  @Input()
  set selectedItem(value: string) {
    this._selectedItem = value;
    if (!this.menu.instance) {
      return;
    }

    this.menu.instance.selectItem(value);
  }

  private _items!: Record<string, unknown>[];
  /*get items() {
    if (!this._items) {
      this._items = navigation.map((item) => {
        if(item['path'] && !(/^\//.test(item['path'] as string))){
          item['path'] = `/${item['path']}`;
        }
        return { ...item, expanded: !this._compactMode }
      });
    }

    return this._items;
  }*/
  private _compactMode = false;
  @Input()
  hasSearchInput: boolean = false;

  showSearchInput: boolean = false;

  constructor(private elementRef: ElementRef,private coordinatesService: CoordinatesService) {}

  onItemClick(event: DxTreeViewTypes.ItemClickEvent) {
    this.selectedItemChanged.emit(event);
    if (event.itemData && event.itemData['path'] === '/home') {
      this.showSearchInput = true;
    }
  }

  ngAfterViewInit() {
    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.subscribe(() => {
        this.showSearchInput = true;
      });
    });
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, 'dxclick');
  }

  /*onSearch() {
    console.log('Search button clicked');
    const input = this.elementRef.nativeElement.querySelector('.search-input') as HTMLInputElement;
    const value = input.value.trim();
    const [lat, lng] = value.split(',').map(coord => parseFloat(coord.trim()));

    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`Emitting coordinates: ${lat}, ${lng}`);
      this.coordinatesService.setCoordinates({ lat, lng });
    } else {
      alert('Veuillez entrer des coordonnées valides (Latitude, Longitude).');
    }
  }*/
}

@NgModule({
  imports: [ DxTreeViewModule, CommonModule ],
  declarations: [ SideNavigationMenuComponent ],
  exports: [ SideNavigationMenuComponent ]
})
export class SideNavigationMenuModule { }
