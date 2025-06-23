import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SapService, LeaveResponse } from '../../services/sap.service';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="leave-container">
      <div class="payslip-header">
        <h2>Leave Information</h2>
        <div class="navigation">
          <button (click)="navigateToProfile()">Back to Profile</button>
        </div>
      </div>
      <div class="leave-content" *ngIf="leaveData && leaveData.length > 0">
        <h2>Leave Records</h2>
        <div *ngFor="let leave of leaveData" class="leave-record">
          <p><strong>Description:</strong> {{leave['description']}}</p>
          <p><strong>Start Date:</strong> {{leave['startDate']}}</p>
          <p><strong>End Date:</strong> {{leave['endDate']}}</p>
          <p><strong>Duration:</strong> {{leave['duration']}}</p>
          <p><strong>Approved By:</strong> {{leave['approvedBy']}}</p>
          <p><strong>Registered Date:</strong> {{leave['registeredDate']}}</p>
          <p><strong>Employee ID:</strong> {{leave['employeeId']}}</p>
        </div>
      </div>
      <div *ngIf="!leaveData || leaveData.length === 0 && !isLoading">
        <p>No leave records found.</p>
      </div>
      <div *ngIf="errorMessage" class="error-message">
        <p>{{errorMessage}}</p>
      </div>
    </div>
  `,
  styles: [`
   .leave-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .payslip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

  .navigation {
      display: flex;
      justify-content: flex-end;
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

    .leave-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .leave-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .leave-section {
      margin-bottom: 2rem;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
    }

    h2 {
      color: #666;
      margin-bottom: 1rem;
    }

    p {
      margin: 0.5rem 0;
      color: #444;
    }

    strong {
      color: #333;
    }

    .leave-record {
      border: 1px solid #eee;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
    }

    .error-message {
      color: red;
      margin-top: 1rem;
    }
  `]
})
export class LeaveComponent implements OnInit {
  leaveData: LeaveResponse['data'] | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  pernr: string = '';

  constructor(
    private sapService: SapService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.pernr = this.route.snapshot.params['pernr'];
    this.loadLeaveData();
  }

  loadLeaveData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.sapService.getLeaveData(this.pernr).subscribe({
      next: (response) => {
        if (response.success) {
          this.leaveData = response.data;
        } else {
          this.errorMessage = 'Failed to load leave data';
        }
      },
      error: (error) => {
        this.errorMessage = 'An error occurred while loading leave data';
        console.error('Leave error:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  navigateToProfile() {
    this.router.navigate(['/profile', this.pernr]);
  }

  logout() {
    this.router.navigate(['/login']);
  }
} 