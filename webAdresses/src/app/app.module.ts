import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SideNavOuterToolbarModule, SideNavInnerToolbarModule } from './layouts';

import { AuthService, ScreenService, AppInfoService } from './shared/services';
import { UnauthenticatedContentModule } from './unauthenticated-content';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './pages/home/home.component';
import { SideNavigationMenuModule } from './shared/components';
import { CoordinatesService } from './shared/services/coordinates.service';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent 
  ],
  imports: [
    BrowserModule,
    SideNavOuterToolbarModule,
    SideNavInnerToolbarModule,
    HttpClientModule,
    SideNavigationMenuModule,
    CommonModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    AuthService,
    ScreenService,
    AppInfoService,
    CoordinatesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
