import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';
  loginMessage: string = '';

  constructor(
    private authService: AuthService,
    private navController: NavController 
  ) { }

  ngOnInit() {
  }

  login() {
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        console.log(response);
        this.loginMessage = 'erreur!';  
        
        this.navController.navigateRoot('/home');
      },
      (error) => {
        console.error(error);
        this.loginMessage = 'Échec de la connexion. Veuillez réessayer.';  // Message en cas d'erreur
      }
    );
  }
}
