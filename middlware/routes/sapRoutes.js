const express = require('express');
const router = express.Router();
const sapService = require('../services/sapService');
const { AppError, handleError } = require('../utils/errorHandler');

router.post('/login', async (req, res, next) => {
    try {
        const { empId, password } = req.body;

        if (!empId || !password) {
            throw new AppError('Employee ID and password are required', 400, 'VALIDATION_ERROR');
        }

        const result = await sapService.login(empId, password);
        if (result.message == 'WELCOME USER') {
            res.json({
                success: true,
                data: result
            });
        } else {
            res.json({
                success: false
            })
        }

    } catch (error) {
        next(error);
    }
});

router.get('/profile/:pernr', async (req, res, next) => {
    try {
        const { pernr } = req.params;

        if (!pernr) {
            throw new AppError('Employee number is required', 400, 'VALIDATION_ERROR');
        }

        const result = await sapService.getProfile(pernr);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

router.get('/leave/:pernr', async (req, res, next) => {
    try {
        const { pernr } = req.params;

        if (!pernr) {
            throw new AppError('Employee number is required', 400, 'VALIDATION_ERROR');
        }

        const result = await sapService.getLeaveData(pernr);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

router.get('/payslip/:pernr', async (req, res, next) => {
    try {
        const { pernr } = req.params;

        if (!pernr) {
            throw new AppError('Employee number is required', 400, 'VALIDATION_ERROR');
        }

        const result = await sapService.getPayslip(pernr);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

router.get('/payslip-form/:pernr', async (req, res, next) => {
    try {
        const { pernr } = req.params;
        const { year, month } = req.query;
        console.log(year,month)

        if (!pernr || !year || !month) {
            throw new AppError('Employee number, year, and month are required', 400, 'VALIDATION_ERROR');
        }

        const result = await sapService.getPayslipForm(pernr, year, month);

        // Set headers for PDF download
        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);

        // Send the PDF data
        res.send(Buffer.from(result.pdfData, 'base64'));
    } catch (error) {
        next(error);
    }
});

router.post('/payslip-email/:pernr', async (req, res, next) => {
    try {
        const { pernr } = req.params;
        const { year, month, email, name } = req.body;

        if (!pernr || !year || !month || !email || !name) {
            return res.status(400).json({
                message: 'Missing required parameters: pernr, year, month, email, and name are required.'
            });
        }

        await sapService.sendPayslipEmail(pernr, year, month, "sanj21212.me@rmkec.ac.in", name);
        res.status(200).json({
            message: 'Payslip email sent successfully.'
        });
    } catch (error) {
        console.error('Error sending payslip email:', error);
        next(error); // Pass the error to the error handling middleware
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: err.errorCode || 'INTERNAL_ERROR'
        }
    });
});

module.exports = router; 