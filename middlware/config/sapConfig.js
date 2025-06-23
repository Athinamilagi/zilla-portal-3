const SAP_CONFIG = {
    baseURL: 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap',
    auth: 'Basic SzkwMTQ1NzpTYW5qYXkxMjM0NQ==',
    endpoints: {
        login: '/zssm34_p3_login_ws?sap-client=100',
        profile: '/zssm34_p3_profile_ws?sap-client=100',
        leave: '/zssm34_p3_leave_ws?sap-client=100',
        payslip: '/zssm34_p3_payslip_ws?sap-client=100',
        payslipForm: '/zssm34_p3_payslip_form_ws?sap-client=100'
    }
};

module.exports = {
    SAP_CONFIG
}; 