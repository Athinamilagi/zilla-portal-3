const express = require('express');
const cors = require('cors');
const sapRoutes = require('./routes/sapRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors())
app.use(express.json());

// Routes
app.use('/api/sap', sapRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 