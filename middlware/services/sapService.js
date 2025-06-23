const axios = require('axios');
const { parseXML } = require('../utils/xmlParser');
const { SAP_CONFIG } = require('../config/sapConfig');
const { handleError } = require('../utils/errorHandler');
const nodemailer = require('nodemailer');

class SAPService {

    constructor() {
        this.baseURL = SAP_CONFIG.baseURL;
        this.headers = {
            'Content-Type': 'text/xml',
            'Authorization': SAP_CONFIG.auth
        };
        this.month = null;
        this.pernr = null;
        this.year = null;
    }

    async login(empId, password) {
        try {
            const soapEnvelope = this._createLoginEnvelope(empId, password);
            const response = await this._makeRequest(SAP_CONFIG.endpoints.login, soapEnvelope);
            const parsedResponse = await parseXML(response.data);
            return this._transformLoginResponse(parsedResponse);
        } catch (error) {
            throw handleError(error, 'Login failed');
        }
    }

    async getProfile(pernr) {
        try {
            const soapEnvelope = this._createProfileEnvelope(pernr);
            const response = await this._makeRequest(SAP_CONFIG.endpoints.profile, soapEnvelope);
            const parsedResponse = await parseXML(response.data);
            return this._transformProfileResponse(parsedResponse);
        } catch (error) {
            throw handleError(error, 'Failed to fetch profile');
        }
    }

    async getLeaveData(pernr) {
        try {
            console.log('Leave Request:', { pernr });
            const soapEnvelope = this._createLeaveEnvelope(pernr);
            const response = await this._makeRequest(SAP_CONFIG.endpoints.leave, soapEnvelope);
            const parsedResponse = await parseXML(response.data);
            console.log('Leave Response:', parsedResponse);
            return this._transformLeaveResponse(parsedResponse);
        } catch (error) {
            throw handleError(error, 'Failed to fetch leave data');
        }
    }

    async getPayslip(pernr) {
        try {
            const soapEnvelope = this._createPayslipEnvelope(pernr);
            const response = await this._makeRequest(SAP_CONFIG.endpoints.payslip, soapEnvelope);
            const parsedResponse = await parseXML(response.data);
            return this._transformPayslipResponse(parsedResponse);
        } catch (error) {
            throw handleError(error, 'Failed to fetch payslip data');
        }
    }

    async getPayslipForm(pernr, year, month) {
        try {
            const soapEnvelope = this._createPayslipFormEnvelope(pernr, year, month);
            const response = await this._makeRequest(SAP_CONFIG.endpoints.payslipForm, soapEnvelope);
            const parsedResponse = await parseXML(response.data);
            return this._transformPayslipFormResponse(parsedResponse, pernr, year, month);
        } catch (error) {
            throw handleError(error, 'Failed to fetch payslip form');
        }
    }

    async sendPayslipEmail(pernr, year, month, email, userName) {
        try {
            // First get the payslip form
            const payslipFormResponse = await this.getPayslipForm(pernr, year, month);
            const pdf = Buffer.from(payslipFormResponse.pdfData, 'base64');
            console.log(email)
            if (!payslipFormResponse || !payslipFormResponse.pdfData) {
                throw new Error('Failed to generate payslip: Missing PDF data');
            }

            // Create email transporter
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'ashwinnraj003@gmail.com',
                    pass: 'hwrppnsaznfkopnm'
                }
            });

            // Send email
            const res = await transporter.sendMail({
                from: '"Employee Portal" <sanjayrajarathinam@gmail.com',
                to: email,
                subject: `Payslip for ${month} ${year}`,
                text: `Hi ${userName},

Please find attached your payslip for ${month} ${year}. 

If you have any questions or need further assistance, feel free to reach out.

Best regards,  
Employee Portal Team`
                ,
                attachments: [{
                    filename: payslipFormResponse.fileName,
                    content: pdf,
                    contentType: payslipFormResponse.contentType
                }]
            });
            return {
                success: true,
                message: 'Payslip sent successfully'
            };
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error(error.message || 'Failed to send payslip email');
        }
    }

    _createLoginEnvelope(empId, password) {
        return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZSSM34_P3_LOGIN>
         <IV_PASSWORD>${password}</IV_PASSWORD>
         <IV_EMPID>${empId}</IV_EMPID>
      </urn:ZSSM34_P3_LOGIN>
   </soapenv:Body>
</soapenv:Envelope>`;
    }

    _createProfileEnvelope(pernr) {
        return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZSSM34_P3_PROFILE>
         <EV_PERNR>${pernr}</EV_PERNR>
      </urn:ZSSM34_P3_PROFILE>
   </soapenv:Body>
</soapenv:Envelope>`;
    }

    _createLeaveEnvelope(pernr) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
   <soap-env:Header/>
   <soap-env:Body>
      <n0:ZSSM34_P3_LEAVE xmlns:n0="urn:sap-com:document:sap:rfc:functions">
         <IV_PERNR>${pernr}</IV_PERNR>
      </n0:ZSSM34_P3_LEAVE>
   </soap-env:Body>
</soap-env:Envelope>`;
    }

    _createPayslipEnvelope(pernr) {
        return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:Zssm34P3Payslip>
         <IvPernr>${pernr}</IvPernr>
      </urn:Zssm34P3Payslip>
   </soapenv:Body>
</soapenv:Envelope>`;
    }

    _createPayslipFormEnvelope(pernr, year, month) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:ZSSM34_P3_PAYSLIP_FORM>
         <IV_PERNR>${pernr}</IV_PERNR>
         <YEAR>${year}</YEAR>
         <MONTH_NO>${month}</MONTH_NO>
      </urn:ZSSM34_P3_PAYSLIP_FORM>
   </soapenv:Body>
</soapenv:Envelope>`;
    }

    async _makeRequest(endpoint, data) {
        const config = {
            method: 'post',
            url: `${this.baseURL}${endpoint}`,
            headers: this.headers,
            data: data
        };
        const response = await axios.request(config);
        return response;
    }

    _transformLoginResponse(parsedResponse) {
        const response = parsedResponse['soap-env:Envelope']['soap-env:Body']['n0:ZSSM34_P3_LOGINResponse'];
        // Check if response exists and has the required properties
        if (!response || !response.EV_MESSAGE || !response.EV_PERNR) {
            console.error('Invalid response structure:', response);
            throw new Error('Invalid response structure from SAP');
        }

        return {
            message: response.EV_MESSAGE,
            pernr: String(response.EV_PERNR).padStart(8, '0')
        };
    }

    _transformProfileResponse(parsedResponse) {
        const response = parsedResponse['soap-env:Envelope']['soap-env:Body']['n0:ZSSM34_P3_PROFILEResponse'];
        return {
            personalInfo: {
                fullName: response.FULL_NAME,
                gender: response.GENDER,
                birthDate: response.BIRTHDATE,
                nationality: response.NATIONALITY,
                email: response.EMAIL
            },
            employmentInfo: {
                employeeId: response.OBJECT_TYPE,
                joinDate: response.JOIN_DATE,
                companyName: response.COMPANY_NAME,
                companyCode: response.COMPANY_CODE
            },
            address: {
                type: response.ADDRESS_TYPE,
                city: response.CITY,
                location: response.LOCATION,
                country: response.COUNTRY
            },
            bankDetails: {
                account: response.BANK_ACCOUNT,
                bankKey: response.BANK_KEY,
                bankCountry: response.BANK_COUNTRY
            }
        };
    }

    _transformLeaveResponse(parsedResponse) {
        const response = parsedResponse['soap-env:Envelope']['soap-env:Body']['n0:ZSSM34_P3_LEAVEResponse'];
        const leaveData = response.ET_LEAVE_DATA.item;

        // Handle both single item and array of items
        const items = Array.isArray(leaveData) ? leaveData : [leaveData];

        return items.map(item => ({
            employeeId: item.EMPLOYEE_ID,
            registeredDate: item.REGISTERED_DATE,
            startDate: item.START_DATE,
            endDate: item.END_DATE,
            duration: item.DURATION,
            status: item.STATUS,
            approvedBy: item.APPROVED_BY,
            description: item.DESCRIPTION
        }));
    }

    _transformPayslipResponse(parsedResponse) {
        const response = parsedResponse['soap-env:Envelope']['soap-env:Body']['n0:Zssm34P3PayslipResponse'];

        if (!response) {
            console.error('Invalid payslip response structure:', response);
            throw new Error('Invalid payslip response structure from SAP');
        }

        return {
            employeeId: String(response.Personnelno).padStart(8, '0'),
            employeeName: response.FullName,
            companyName: response.CompanyName,
            payscaleType: response.PayscaleType,
            wageType: response.WageType,
            workingHours: response.WorkingHours,
            scaleSalary: response.ScaleSalary,
            amount: response.Amount,
            currency: response.CurrencyDesc,
            validFrom: response.ValidFrom,
            approver: response.Approver,
            bankDetails: {
                account: response.BankAccount,
                key: response.BankKey,
                country: response.BankCountry
            }
        };
    }

    _transformPayslipFormResponse(parsedData, pernr, year, month) {
        const pdfData = parsedData['soap-env:Envelope']['soap-env:Body']['n0:ZSSM34_P3_PAYSLIP_FORMResponse']['EV_PDF_DATA'];
        return {
            pdfData: pdfData,
            contentType: 'application/pdf',
            fileName: `payslip_${pernr}_${year}_${month}.pdf`
        };
    }
}

module.exports = new SAPService();