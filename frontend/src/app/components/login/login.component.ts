import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SapService } from '../../services/sap.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h2>Employee Portal Login</h2>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="empId">Employee ID</label>
            <input
              type="text"
              id="empId"
              name="empId"
              [(ngModel)]="empId"
              required
              #empIdInput="ngModel"
            />
            <div *ngIf="empIdInput.invalid && empIdInput.touched" class="error">
              Employee ID is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              #passwordInput="ngModel"
            />
            <div *ngIf="passwordInput.invalid && passwordInput.touched" class="error">
              Password is required
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .login-box {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #666;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
    }

    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .error-message {
      color: #dc3545;
      text-align: center;
      margin: 1rem 0;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #0056b3;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class LoginComponent {
  empId: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private sapService: SapService,
    private router: Router
  ) { }

  onSubmit() {
    if (this.empId && this.password) {
      this.isLoading = true;
      this.errorMessage = '';
      const credentials = {
        empId : this.empId,
        password : this.password
      }
      this.sapService.login(credentials).subscribe({
        next: (response) => {
          if (response.success) {
            localStorage.setItem('empId', response.data.pernr);
            this.router.navigate(['/profile', response.data.pernr]);
          } else {
            this.errorMessage = response.data.message || 'Login failed';
          }
        },
        error: (error) => {
          this.errorMessage = 'An error occurred during login. Please try again.';
          console.error('Login error:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
} 