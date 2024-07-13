import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EnqueteursComponent } from './enqueteurs/enqueteurs.component';
import { EnquetesComponent } from './enquetes/enquetes.component';
import { MapComponent } from './map/map.component';

const routes: Routes = [
  {path:'', redirectTo:'dashboard', pathMatch:'full'},
  {path:'dashboard', component:DashboardComponent},
  {path:'enqueteurs', component:EnqueteursComponent},
  {path:'enquetes', component:EnquetesComponent},
  {path:'map', component:MapComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
