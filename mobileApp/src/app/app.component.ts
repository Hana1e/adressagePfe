import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';  
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  showForm: boolean = false;
  folders: string[] = []; 
  newFolderName: string = '';
  showFolderList: boolean = false;
  constructor(private router: Router,  private menu: MenuController, private authService: AuthService ) {}
  logout() {
    console.log("Logout clicked");
    this.authService.logout();// localStorage.removeItem('authToken'); //idk , check this 
    this.menu.close(); 
    this.navigateToLoginScreen();
  }
  navigateToLoginScreen() {
    this.router.navigate(['/login']); 
  }
  toggleForm() {
    this.showForm = !this.showForm;
  }

  onSubmit(folderName: string) {
    console.log("Formulaire soumis avec le nom du dossier:", folderName);
    this.folders.push(folderName); 
    this.showForm = false;
  }

  onCancel() {
    console.log("Formulaire non soumis !");
    this.showForm = false;
  }

  showFolders() {
    this.showFolderList = !this.showFolderList;
  }
  
}
