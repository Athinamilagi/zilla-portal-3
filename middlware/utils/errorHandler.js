class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const handleError = (error, customMessage) => {
    console.error('Original Error in handleError:', error);
    if (error.response) {
        // SAP API error
        throw new AppError(
            customMessage || error.response.data || 'SAP API Error',
            error.response.status || 500,
            'SAP_API_ERROR'
        );
    } else if (error.request) {
        // Network error
        throw new AppError(
            'Network Error: Unable to reach SAP server',
            503,
            'NETWORK_ERROR'
        );
    } else {
        // Other errors
        throw new AppError(
            customMessage || error.message,
            500,
            'INTERNAL_ERROR'
        );
    }
};

module.exports = {
    AppError,
    handleError
}; 