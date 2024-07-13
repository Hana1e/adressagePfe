// add-folder.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-add-folder',
  templateUrl: './add-folder.component.html',
  styleUrls: ['./add-folder.component.scss'],
})
export class AddFolderComponent implements OnInit {
  folderName: string = '';

  @Output() folderAdded = new EventEmitter<string>();
  @Output() canceled = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  onSubmit() {
    // Ajoutez ici la logique pour ajouter le dossier
    this.folderAdded.emit(this.folderName);
    this.folderName = ''; // Effacez le champ après l'ajout
  }

  onCancel() {
    this.canceled.emit();
  }
}
