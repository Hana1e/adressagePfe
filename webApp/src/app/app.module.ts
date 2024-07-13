import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BodyComponent } from './body/body.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EnquetesComponent } from './enquetes/enquetes.component';
import { EnqueteursComponent } from './enqueteurs/enqueteurs.component';
import { HeaderComponent } from './header/header.component';
import {OverlayModule} from '@angular/cdk/overlay';
import {CdkMenuModule} from '@angular/cdk/menu';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from './services/user.service';
import { MapComponent } from './map/map.component';
import { EnqueteService } from './services/enquete.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
  declarations: [
    AppComponent,
    BodyComponent,
    SidenavComponent,
    DashboardComponent,
    EnquetesComponent,
    EnqueteursComponent,
    HeaderComponent,
    MapComponent,
    
   
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    OverlayModule,
    CdkMenuModule,
    FormsModule,
    HttpClientModule,
    MatProgressBarModule
  ],
  providers: [ UserService, EnqueteService],
  bootstrap: [AppComponent]
})
export class AppModule { }
