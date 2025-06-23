import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LeaveComponent } from './components/leave/leave.component';
import { PayslipComponent } from './components/payslip/payslip.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'profile/:pernr', component: ProfileComponent },
  { path: 'leave/:pernr', component: LeaveComponent },
  { path: 'payslip/:pernr', component: PayslipComponent },
  { path: '**', redirectTo: '/login' }
];
