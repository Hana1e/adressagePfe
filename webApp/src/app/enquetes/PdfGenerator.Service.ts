import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PdfService } from '../services/pdf.service'; 
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor(private pdfService: PdfService) { }

  generateAndDownloadPDF(enqueteurId: string, enqueteurName: string,layerName: string): void {
    forkJoin([
      this.pdfService.getQuartiersByUserId(enqueteurId),
      this.pdfService.getVoiesDetailsByUserId(enqueteurId)
    ]).subscribe({
      next: ([quartiers, { totalQuartiers, voiesDetails }]) => {
        const pdf = new jsPDF();

        // Ajout d'un cadre
        pdf.setLineWidth(0.5);
        pdf.rect(5, 5, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10);

        // Titre centré
        pdf.setFont('times'); 
        pdf.setFontSize(20);
        pdf.text('Rapport d\'enquête', pdf.internal.pageSize.width / 2, 15, { align: 'center' });

        // Date de téléchargement
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        pdf.setFontSize(11);
        pdf.setTextColor(0);
        pdf.text(`Le : ${formattedDate}`, pdf.internal.pageSize.width / 2, 30, { align: 'center' });
 
        pdf.setFontSize(11);
        pdf.setTextColor(0);
        pdf.text(`Nom de la zone d'adressage : ${layerName}`, pdf.internal.pageSize.width / 2, 45, { align: 'center' });
        // Informations de l'enquêteur
        pdf.setFontSize(11);
        pdf.setTextColor(0);
        pdf.text(`Nom de l'enquêteur : ${enqueteurName}`, 10, 60);

        // Affichage des quartiers
        pdf.setTextColor(0);
        pdf.setFontSize(11);
        let yPos = 70;
        if (quartiers.length > 0) {
            pdf.text(`Nombre de quartiers collectés : ${quartiers.length}`, 10, yPos);
            yPos += 10;

            // Affichage des détails des quartiers et des voies
            quartiers.forEach((quartier, index) => {
                const quartierDetail = voiesDetails.find(detail => detail.quartier === quartier) || { voies: [] };
                pdf.text(`Quartier ${index + 1}: ${quartier} - Nombre de voies collectées : ${quartierDetail.voies.length || 0}`, 10, yPos);
                yPos += 10;

                // Affichage des voies
                if (quartierDetail.voies.length > 0) {
                    quartierDetail.voies.forEach((voie, voieIndex) => {
                        pdf.text(`    ${voieIndex + 1}. ${voie.adresse}`, 20, yPos);
                        yPos += 10;
                    });
                } else {
                    pdf.text(`    Aucune voie collectée pour ce quartier`, 20, yPos);
                    yPos += 5;
                }
            });
        } else {
            pdf.setTextColor(255, 0, 0);
            pdf.text('Aucun quartier collecté', 10, yPos);
        }

        pdf.save('enquete.pdf');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails des quartiers et des voies pour l\'enquêteur sélectionné', error);
      }
    });
  }
}
