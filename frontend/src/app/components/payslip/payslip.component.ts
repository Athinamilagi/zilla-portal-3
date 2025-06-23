import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SapService, ProfileResponse, PayslipFormResponse, EmailResponse } from '../../services/sap.service';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="payslip-container">
      <div class="payslip-header">
        <h2>Payslip Information</h2>
        <div class="navigation">
          <button (click)="openDownloadModal()">Download Payslip</button>
          <button (click)="navigateToProfile()">Back to Profile</button>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="error-message-container">
        <div class="error-message-content">
          {{ errorMessage }}
          <button class="close-error-btn" (click)="clearErrorMessage()">X</button>
        </div>
      </div>

      <!-- Download Modal -->
      <div *ngIf="showDownloadModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Download Payslip</h3>
          <form [formGroup]="downloadForm" (ngSubmit)="downloadPayslip()">
            <div class="form-group">
              <label for="year">Year:</label>
              <select id="year" formControlName="year">
                <option *ngFor="let year of years" [value]="year">{{year}}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="month">Month:</label>
              <select id="month" formControlName="month">
                <option *ngFor="let month of months" [value]="month.value">{{month.label}}</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="closeDownloadModal()">Cancel</button>
              <button 
  type="button" 
  (click)="sendToEmail()"
  [disabled]="downloadForm.invalid || !userEmail || isSendingEmail">
  {{ isSendingEmail ? 'Sending...' : 'Send To Email' }}
</button>

              <button type="submit" [disabled]="downloadForm.invalid || isDownloading">
                {{ isDownloading ? 'Downloading...' : 'Download' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading">
        Loading payslip data...
      </div>

      <div *ngIf="payslipData" class="payslip-content">
        <section class="payslip-section">
          <h3>Employee Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Full Name</label>
              <span>{{ payslipData.employeeName }}</span>
            </div>
            <div class="info-item">
              <label>Personnel Number</label>
              <span>{{ payslipData.employeeId }}</span>
            </div>
            <div class="info-item">
              <label>Company Name</label>
              <span>{{ payslipData.companyName }}</span>
            </div>
            <div class="info-item">
              <label>Valid From</label>
              <span>{{ payslipData.validFrom }}</span>
            </div>
          </div>
        </section>

        <section class="payslip-section">
          <h3>Salary Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Amount</label>
              <span>{{ payslipData.amount | currency:payslipData.currency }}</span>
            </div>
            <div class="info-item">
              <label>Scale Salary</label>
              <span>{{ payslipData.scaleSalary | currency:payslipData.currency }}</span>
            </div>
            <div class="info-item">
              <label>Working Hours</label>
              <span>{{ payslipData.workingHours }} hours</span>
            </div>
            <div class="info-item">
              <label>Wage Type</label>
              <span>{{ payslipData.wageType }}</span>
            </div>
            <div class="info-item">
              <label>Payscale Type</label>
              <span>{{ payslipData.payscaleType }}</span>
            </div>
          </div>
        </section>

        <section class="payslip-section">
          <h3>Bank Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Account</label>
              <span>{{ payslipData.bankDetails.account }}</span>
            </div>
            <div class="info-item">
              <label>Bank Key</label>
              <span>{{ payslipData.bankDetails.key }}</span>
            </div>
            <div class="info-item">
              <label>Bank Country</label>
              <span>{{ payslipData.bankDetails.country }}</span>
            </div>
          </div>
        </section>

        <section class="payslip-section">
          <h3>Approval Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Approved By</label>
              <span>{{ payslipData.approver }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .payslip-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .payslip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
    }

    .navigation {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .navigation button {
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      font-weight: 500;
      min-width: 120px;
      text-align: center;
    }

    .navigation button:hover {
      background-color: #0056b3;
    }

    .logout-btn {
      background-color: #dc3545;
    }

    .logout-btn:hover {
      background-color: #c82333;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .error-message-container {
      position: fixed; /* Use fixed to keep it in view regardless of scroll */
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px 20px;
      border-radius: 5px;
      border: 1px solid #f5c6cb;
      z-index: 2000; /* Higher than modal overlay */
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: fit-content;
      min-width: 300px;
    }

    .error-message-content {
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: space-between;
    }

    .close-error-btn {
      background: none;
      border: none;
      color: #721c24;
      font-size: 1.2rem;
      cursor: pointer;
      margin-left: 15px;
    }

    .close-error-btn:hover {
      color: #490e14;
    }

    .payslip-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    h3 {
      color: #333;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    label {
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    span {
      color: #333;
      font-size: 1rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;
    }

    .modal-content h3 {
      margin-bottom: 1.5rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #666;
    }

    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-group select:focus {
      outline: none;
      border-color: #007bff;
    }

    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .modal-actions button {
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      font-weight: 500;
      min-width: 120px;
      text-align: center;
    }

    .modal-actions button:hover {
      background-color: #0056b3;
    }

    .modal-actions button[type="button"] {
      background-color: #6c757d;
    }

    .modal-actions button[type="button"]:hover {
      background-color: #5a6268;
    }

    .modal-actions button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class PayslipComponent implements OnInit {
  payslipData: any;
  isLoading: boolean = true;
  errorMessage: string = '';
  pernr: string = '';
  showDownloadModal: boolean = false;
  downloadForm: FormGroup;
  isDownloading: boolean = false;
  userEmail: string = '';
  userName: string = '';
  showEmailModal: boolean = false;
  isSendingEmail: boolean = false;
  months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  years: number[] = [];

  constructor(
    private sapService: SapService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.downloadForm = this.fb.group({
      year: ['', Validators.required],
      month: ['', Validators.required]
    });

  }

  ngOnInit() {
    console.log('PayslipComponent initialized');
    this.route.paramMap.subscribe(params => {
      this.pernr = localStorage.getItem('empId') || '';
      if (this.pernr) {
        this.loadPayslipData();
        this.loadUserProfile();
      } else {
        this.errorMessage = 'Personnel number not found. Please log in again.';
        this.isLoading = false;
      }
    });
    this.generateYears();
  }

  clearErrorMessage() {
    this.errorMessage = '';
  }

  loadPayslipData() {
    this.isLoading = true;
    this.sapService.getPayslip(this.pernr).subscribe({
      next: (data) => {
        this.payslipData = data.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payslip data:', error);
        this.errorMessage = 'Failed to load payslip data.';
        this.isLoading = false;
      }
    });
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 10; i--) {
      this.years.push(i);
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    localStorage.removeItem('pernr');
    this.router.navigate(['/login']);
  }

  openDownloadModal() {
    this.showDownloadModal = true;
    this.downloadForm.reset();
    this.clearErrorMessage(); // Clear error when opening modal
    const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed
    const currentYear = new Date().getFullYear();
    this.downloadForm.patchValue({
      year: currentYear,
      month: currentMonth.toString() // Ensure month is a string for the value
    });
  }

  closeDownloadModal() {
    this.showDownloadModal = false;
    this.downloadForm.reset();
    this.clearErrorMessage();
  }

  downloadPayslip() {
    if (this.downloadForm.valid) {
      this.isDownloading = true;
      const { year, month } = this.downloadForm.value;

      // Validate against joining date
      if (!this.payslipData?.validFrom) {
        this.errorMessage = 'Unable to validate joining date.';
        this.isDownloading = false;
        return;
      }

      const joiningDate = new Date(this.payslipData.validFrom);
      const joiningYear = joiningDate.getFullYear();
      const joiningMonth = joiningDate.getMonth() + 1;

      if (year < joiningYear || (year === joiningYear && parseInt(month) < joiningMonth)) {
        this.errorMessage = `Cannot download payslip before joining date (${joiningMonth}/${joiningYear})`;
        this.isDownloading = false;
        return;
      }

      // Validate against current date
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      if (year > currentYear || (year === currentYear && parseInt(month) > currentMonth)) {
        this.errorMessage = 'Cannot download payslip for a future date.';
        this.isDownloading = false;
        return;
      }

      this.sapService.getPayslipForm(this.pernr, year, month).subscribe({
        next: (response) => {
          const pdfData = response.pdfData; // Access pdfData directly
          const fileName = response.fileName;
          const contentType = response.contentType;

          if (pdfData) {
            // Convert base64 to Blob
            const byteCharacters = atob(pdfData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: contentType });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            alert('Payslip downloaded successfully!');
            this.closeDownloadModal();
          } else {
            this.errorMessage = 'PDF data is empty or invalid.';
          }
        },
        error: (err) => {
          console.error('Download error:', err);
          this.errorMessage = 'Failed to download payslip. Please try again.';
        },
        complete: () => {
          this.isDownloading = false;
        }
      });
    }
  }


  sendToEmail() {
    if (this.downloadForm.valid && this.userEmail) {
      this.isSendingEmail = true;
      const { year, month } = this.downloadForm.value;

      if (!this.payslipData?.validFrom) {
        this.errorMessage = 'Unable to validate joining date.';
        this.isSendingEmail = false;
        return;
      }

      const joiningDate = new Date(this.payslipData.validFrom);
      const joiningYear = joiningDate.getFullYear();
      const joiningMonth = joiningDate.getMonth() + 1;

      if (year < joiningYear || (year === joiningYear && parseInt(month) < joiningMonth)) {
        this.errorMessage = `Cannot send payslip before joining date (${joiningMonth}/${joiningYear})`;
        this.isSendingEmail = false;
        return;
      }

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      if (year > currentYear || (year === currentYear && parseInt(month) > currentMonth)) {
        this.errorMessage = 'Cannot send payslip for a future date.';
        this.isSendingEmail = false;
        return;
      }

      this.sapService.sendPayslipEmail(this.pernr, year.toString(), month.toString(), this.userEmail, this.userName).subscribe({
        next: (response) => {
          alert('Payslip sent to email successfully!');
        },
        error: (err) => {
          console.error('Email error:', err);
          this.errorMessage = 'Failed to send payslip to email. Please try again.';
        },
        complete: () => {
          this.isSendingEmail = false;
        }
      });
    } else {
      this.errorMessage = 'Year, month, or email is missing.';
    }
  }


  loadUserProfile() {
    if (this.pernr) {
      this.sapService.getProfile(this.pernr).subscribe({
        next: (userProfile: ProfileResponse) => {
          this.userEmail = userProfile.data.personalInfo.email;
          this.userName = userProfile.data.personalInfo.fullName;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.errorMessage = 'Failed to load user profile for email.';
        }
      });
    }
  }
} 