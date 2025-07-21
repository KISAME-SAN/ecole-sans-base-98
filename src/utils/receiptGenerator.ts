
import { StudentFormData, SchoolClass } from '@/types/school';

export const generateStudentReceipt = (
  studentData: StudentFormData, 
  classes: SchoolClass[]
) => {
  const className = classes.find(c => c.id === studentData.classId)?.name || 'Classe inconnue';
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const timeStr = now.toLocaleTimeString('fr-FR');

  // Créer le contenu HTML du reçu
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reçu d'inscription</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          width: 300px;
          margin: 0;
          padding: 15px;
          font-size: 12px;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 10px;
          color: #666;
        }
        .content {
          margin-bottom: 15px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .label {
          font-weight: bold;
        }
        .footer {
          border-top: 1px solid #000;
          padding-top: 10px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        .total {
          border-top: 2px solid #000;
          padding-top: 10px;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">ÉCOLE</div>
        <div class="subtitle">Reçu d'inscription</div>
      </div>
      
      <div class="content">
        <div class="row">
          <span class="label">Élève:</span>
          <span>${studentData.firstName} ${studentData.lastName}</span>
        </div>
        <div class="row">
          <span class="label">Classe:</span>
          <span>${className}</span>
        </div>
        <div class="row">
          <span class="label">Genre:</span>
          <span>${studentData.gender === 'male' ? 'Garçon' : 'Fille'}</span>
        </div>
        <div class="row">
          <span class="label">Date de naissance:</span>
          <span>${studentData.birthDate}</span>
        </div>
        <div class="row">
          <span class="label">Lieu de naissance:</span>
          <span>${studentData.birthPlace}</span>
        </div>
        <div class="row">
          <span class="label">Téléphone parent:</span>
          <span>${studentData.parentPhone}</span>
        </div>
      </div>
      
      <div class="total">
        INSCRIPTION CONFIRMÉE
      </div>
      
      <div class="footer">
        <div>Date: ${dateStr}</div>
        <div>Heure: ${timeStr}</div>
        <div>Merci de votre confiance</div>
      </div>
    </body>
    </html>
  `;

  // Créer et télécharger le PDF
  const printWindow = window.open('', '', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  }
};
