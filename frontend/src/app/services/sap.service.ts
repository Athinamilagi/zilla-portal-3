import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  success: string;
  data: {
      message: string,
      pernr: string
  }
}

export interface PersonalInfo {
  fullName: string;
  gender: string;
  birthDate: string;
  nationality: string;
  email: string;
}

export interface EmploymentInfo {
  employeeId: string;
  joinDate: string;
  companyName: string;
  companyCode: string;
}

export interface Address {
  type: string;
  city: string;
  location: string;
  country: string;
}

export interface BankDetails {
  account: string;
  bankKey: string;
  bankCountry: string;
}

export interface ProfileData {
  personalInfo: PersonalInfo;
  employmentInfo: EmploymentInfo;
  address: Address;
  bankDetails: BankDetails;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    personalInfo: PersonalInfo;
    employmentInfo: EmploymentInfo;
    address: Address;
    bankDetails: BankDetails;
  };
}

export interface data {
  employeeId: string;
  registeredDate: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: string;
  approvedBy: string;
  description: string;
}

export interface LeaveResponse {
  data: data[];
  success: string;
}

export interface PayslipResponseData {
  employeeId: string;
  employeeName: string;
  companyName: string;
  payscaleType: string;
  wageType: string;
  workingHours: number;
  scaleSalary: number;
  amount: number;
  currency: string;
  validFrom: string;
  approver: string;
  bankDetails: {
    account: string;
    key: string;
    country: string;
  };
}

export interface PayslipResponse {
  success: boolean;
  data: PayslipResponseData;
}

export interface PayslipFormResponse {
  pdfData: string;
  contentType: string;
  fileName: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SapService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<LoginResponse> {
    console.log(credentials)
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/sap/login`, credentials);
  }

  getProfile(pernr: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/api/sap/profile/${pernr}`);
  }

  getLeaveData(pernr: string): Observable<LeaveResponse> {
    return this.http.get<LeaveResponse>(`${this.apiUrl}/api/sap/leave/${pernr}`);
  }

  getPayslip(pernr: string): Observable<PayslipResponse> {
    return this.http.get<PayslipResponse>(`${this.apiUrl}/api/sap/payslip/${pernr}`);
  }

  getPayslipForm(pernr: string, year: string, month: string): Observable<PayslipFormResponse> {
    return this.http.post<PayslipFormResponse>(`${this.apiUrl}/api/sap/payslip-form`, {
      pernr,
      year,
      month
    }, {
      responseType: 'json' // Expecting JSON response with base64 encoded PDF data
    });
  }

  sendPayslipEmail(pernr: string, year: string, month: string, email: string, name: string): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.apiUrl}/api/sap/payslip-email/${pernr}`, {
      year,
      month,
      email,
      name
    });
  }
}