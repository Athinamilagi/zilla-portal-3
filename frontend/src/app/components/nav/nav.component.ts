import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav-bar" *ngIf="pernr">
      <div class="nav-links">
        <a [routerLink]="['/profile', pernr]" class="nav-link" routerLinkActive="active">Profile</a>
        <a [routerLink]="['/leave', pernr]" class="nav-link" routerLinkActive="active">Leave</a>
        <a [routerLink]="['/payslip', pernr]" class="nav-link" routerLinkActive="active">Payslip</a>
      </div>
      <button class="logout-btn" (click)="logout()">Logout</button>
    </nav>
  `,
  styles: [`
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background-color: #f5f5f5;
    }

    .nav-link.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .logout-btn {
      padding: 0.5rem 1rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .logout-btn:hover {
      background-color: #c82333;
    }
  `]
})
export class NavComponent implements OnInit, OnDestroy {
  pernr: any;
  private routerSubscription: Subscription;

  constructor(private router: Router) {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkAuth();
    });
  }

  ngOnInit() {
    this.checkAuth();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkAuth() {
    const user = localStorage.getItem('empId');
    if (user) {
      this.pernr = user;
    } else {
      this.pernr = null;
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('empId');
    this.pernr = null;
    this.router.navigate(['/login']);
  }
} 