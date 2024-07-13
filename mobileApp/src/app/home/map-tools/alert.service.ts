import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { RecensementService } from 'src/app/services/recensement.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertController: AlertController,private recensementService: RecensementService) {}

  async presentConfirmationAlert(header: string, message: string, onConfirm: () => void, onCancel: () => void, onCancelFooter: () => void) {
    const alert = await this.alertController.create({
        header,
        message,
        buttons: [
            {
                text: 'Annuler',
                role: 'cancel',
                handler: () => {
                    onCancel();
                    onCancelFooter();
                }
            },
            {
                text: 'Confirmer',
                handler: () => onConfirm()  
            }
        ]
    });

    await alert.present();
  }
  async presentSelectPolylineAlert(onSelect: () => void) {
    const alert = await this.alertController.create({
      header: 'Sélectionner la voie',
      buttons: [
        {
          text: 'Sélectionner',
          handler: () => onSelect()
        }
      ]
    });

    await alert.present();
  }
  async presentSavePointConfirmation(onConfirm: () => void, onCancel: () => void) {
    await this.presentConfirmationAlert(
      'Confirmation',
      'Êtes-vous sûr d\'enregistrer ce point de base pour cette voie ?',
      onConfirm,
      onCancel,
      
      () => {}
    );
  }

  async presentErrorAlert(message: string, onOK: () => void, onOtherAction: () => void, otherActionText: string) {
    const alert = await this.alertController.create({
      header: 'Erreur',
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            onOK();
          }
        },
        {
          text: 'show point',
          handler: () => {
            onOtherAction();
          }
        }
      ]
    });

    await alert.present();
}

async presentTemporaryMessage(message: string, buttonText: string, buttonHandler: () => void): Promise<void> {
  const alert = await this.alertController.create({
    message,
    cssClass: 'temporary-alert',
    buttons: [
      {
        text: buttonText,
        handler: buttonHandler
      }
    ]
  });

  await alert.present();
}
async presentSelectBuildingAlert(onSelect: () => void) {
  const alert = await this.alertController.create({
    header: 'Sélectionner le bâtiment à numéroter',
    buttons: [
      {
        text: 'Sélectionner',
        handler: () => onSelect()
      }
    ]
  });

  await alert.present();
}
async presentNumberingConfirmation(onConfirm: () => void, onCancel: () => void) {
  await this.presentConfirmationAlert(
    'Confirmation',
    'Êtes-vous sûr d\'enregistrer le numéro pour ce bâtiment ?',
    onConfirm,
    onCancel,
    () => {}
  );
}


async presentAjoutCaractereNumerotation(onConfirm: (selectedOption: string, rive?: string) => void, onCancel: () => void) {
  const alert = await this.alertController.create({
    message: 'Sélectionner la rive du bâtiment',
    inputs: [
      {
        name: 'radioOption',
        type: 'radio',
        label: 'Rive Droite (RD)',
        value: 'RD',
        checked: true 
      },
      {
        name: 'radioOption',
        type: 'radio',
        label: 'Rive Gauche (RG)',
        value: 'RG'
      }
    ],
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel',
        handler: onCancel
      },
      {
        text: 'Confirmer',
        handler: (data) => {
          onConfirm(data);
        }
      }
    ]
  });

  await alert.present();
}


async presentInputAlert(header: string, onConfirm: (sequentialNumber: number) => void, onCancel: () => void) {
  const alert = await this.alertController.create({
    header,
    inputs: [
      {
        name: 'sequentialNumber',
        type: 'number',
        placeholder: 'Numéro séquentiel',
        min: 1,
        max: 100
      }
    ],
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel',
        handler: onCancel
      },
      {
        text: 'Confirmer',
        handler: (data) => onConfirm(data.sequentialNumber)
      }
    ]
  });

  await alert.present();
}



}
