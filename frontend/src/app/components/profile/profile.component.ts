import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SapService, ProfileResponse, ProfileData } from '../../services/sap.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h2>Employee Profile</h2>
      </div>

      <div *ngIf="isLoading" class="loading">
        Loading profile data...
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="profileData" class="profile-content">
        <section class="profile-section">
          <h3>Personal Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Full Name</label>
              <span>{{ profileData.personalInfo.fullName }}</span>
            </div>
            <div class="info-item">
              <label>Gender</label>
              <span>{{ profileData.personalInfo.gender }}</span>
            </div>
            <div class="info-item">
              <label>Birth Date</label>
              <span>{{ profileData.personalInfo.birthDate }}</span>
            </div>
            <div class="info-item">
              <label>Nationality</label>
              <span>{{ profileData.personalInfo.nationality }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{ profileData.personalInfo.email }}</span>
            </div>
          </div>
        </section>

        <section class="profile-section">
          <h3>Employment Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Employee ID</label>
              <span>{{ profileData.employmentInfo.employeeId }}</span>
            </div>
            <div class="info-item">
              <label>Join Date</label>
              <span>{{ profileData.employmentInfo.joinDate }}</span>
            </div>
            <div class="info-item">
              <label>Company Name</label>
              <span>{{ profileData.employmentInfo.companyName }}</span>
            </div>
            <div class="info-item">
              <label>Company Code</label>
              <span>{{ profileData.employmentInfo.companyCode }}</span>
            </div>
          </div>
        </section>

        <section class="profile-section">
          <h3>Address Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Type</label>
              <span>{{ profileData.address.type }}</span>
            </div>
            <div class="info-item">
              <label>City</label>
              <span>{{ profileData.address.city }}</span>
            </div>
            <div class="info-item">
              <label>Location</label>
              <span>{{ profileData.address.location }}</span>
            </div>
            <div class="info-item">
              <label>Country</label>
              <span>{{ profileData.address.country }}</span>
            </div>
          </div>
        </section>

        <section class="profile-section">
          <h3>Bank Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Account</label>
              <span>{{ profileData.bankDetails.account }}</span>
            </div>
            <div class="info-item">
              <label>Bank Key</label>
              <span>{{ profileData.bankDetails.bankKey }}</span>
            </div>
            <div class="info-item">
              <label>Bank Country</label>
              <span>{{ profileData.bankDetails.bankCountry }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .navigation {
      display: flex;
      gap: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
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

    .error-message {
      color: #dc3545;
      text-align: center;
      padding: 1rem;
      margin: 1rem 0;
      background-color: #f8d7da;
      border-radius: 4px;
    }

    .profile-section {
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
  `]
})
export class ProfileComponent implements OnInit {
  profileData: ProfileData | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  pernr: string = '';

  constructor(
    private sapService: SapService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.pernr = this.route.snapshot.params['pernr'];
    this.loadProfileData();
  }

  loadProfileData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.sapService.getProfile(this.pernr).subscribe({
      next: (response) => {
        if (response.success) {
          this.profileData = response.data;
        } else {
          this.errorMessage = 'Failed to load profile data';
        }
      },
      error: (error) => {
        this.errorMessage = 'An error occurred while loading profile data';
        console.error('Profile error:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  navigateToLeave() {
    this.router.navigate(['/leave', this.pernr]);
  }

  navigateToPayslip() {
    this.router.navigate(['/payslip', this.pernr]);
  }

  logout() {
    this.router.navigate(['/login']);
  }
} 