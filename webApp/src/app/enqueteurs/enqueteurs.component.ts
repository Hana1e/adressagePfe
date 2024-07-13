import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
@Component({
  selector: 'app-enqueteurs',
  templateUrl: './enqueteurs.component.html',
  styleUrls: ['./enqueteurs.component.scss']
})
export class EnqueteursComponent implements OnInit {

  constructor(private userService: UserService )
   {}

  showForm: boolean = false;
  name: string = '';
  email: string = '';
  telephone:string='';
  password: string = '';
  role: string = 'enqueteur';
  users: any[] = [];
  selectedUser: any = null;
  isUpdateFormVisible: boolean = false;

  ngOnInit() {
    this.loadUsersFromDatabase();
  }

  loadUsersFromDatabase() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        localStorage.setItem('users', JSON.stringify(this.users));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs depuis la base de données :', error);
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  closeForm() {
    this.showForm = false;
  }

  submitForm() {
    const generatedPassword = this.generatePassword(); // Générer un mot de passe aléatoire
    const userData = {
      name: this.name,
      email: this.email,
      telephone: this.telephone,
      password: generatedPassword,
      role: this.role
    };
  
    this.userService.addUser(userData).subscribe({
      next: (user) => {
        console.log('Enquêteur ajouté avec succès');
        // Afficher un message à l'utilisateur
        alert('Utilisateur ajouté avec succès');
        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        this.resetForm();
        this.closeForm(); 
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de l\'enquêteur :', error);
      }
    });
  }
  

  //cest pour generer un mdp aleatoire
  generatePassword(): string {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.telephone= '';
    this.role = 'enqueteur';
  };

  deleteUser(id: string) {
    console.log('ID de l\'utilisateur à supprimer :', id);
    
    const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?');
  
    if (confirmation) {
      // cas de confirmation
      this.userService.getUserById(id).subscribe({
        next: (user) => {
          console.log('Utilisateur trouvé :', user);
          this.userService.deleteUser(id).subscribe({
            next: () => {
              console.log('Utilisateur supprimé avec succès');
              this.users = this.users.filter(user => user._id !== id);
              localStorage.setItem('users', JSON.stringify(this.users));
            },
            error: (error) => {
              console.error('Erreur lors de la suppression de l\'utilisateur :', error);
            }
          });
        },
        error: (error) => {
          console.error('Erreur lors de la recherche de l\'utilisateur :', error);
        }
      });
    }
  } 


  updateUser(user: any) {
    this.selectedUser = user;
    this.isUpdateFormVisible = true;
  }

  submitUpdateForm() {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser._id, this.selectedUser).subscribe({
        next: () => {
          console.log('Utilisateur mis à jour avec succès');
       
          this.isUpdateFormVisible = false; // Masquer le formulaire après la mise à jour réussie
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
        }
      });
    }
  }
  
  
}

  

  