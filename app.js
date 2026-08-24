import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
const PORT = 3327;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(express.json({ limit: '1mb' }));

app.use('/public', express.static(path.join(__dirname, 'public')));

// Also serve static files from root for standard assets if referenced directly
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'CoBAC registration backend is running'
    });
});

// --------------------------------------------------
// Google Sheets
// --------------------------------------------------

async function appendRecordToSheet(formData) {
    const auth = new google.auth.GoogleAuth({
        credentials: process.env.GOOGLE_CREDENTIALS_JSON ? JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON) : undefined,
        keyFile: process.env.GOOGLE_CREDENTIALS_JSON ? undefined : path.join(__dirname, 'credentials.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const client = await auth.getClient();

    const googleSheets = google.sheets({
        version: 'v4',
        auth: client
    });

    const spreadsheetId = '1jT7eP5uIaNcWDqOy8avoz938Dk00ZgUFVY-TLiMPdWo';

    const requestBody = {
        values: [
            [
                formData.name,
                formData.email,
                formData.phone,
                formData.cityCountry,
                formData.job || '',
                formData.company,
                formData.invoiceAddress,
                formData.membership,
                formData.source,
                formData.photoConsent ? 'Yes' : 'No',
                new Date().toISOString()
            ]
        ]
    };

    await googleSheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A1:K',
        valueInputOption: 'USER_ENTERED',
        requestBody
    });
}

// --------------------------------------------------
// Form Submission
// --------------------------------------------------

app.post('/api/submit-form', async(req, res) => {
    try {
        const formData = req.body;
        console.log('Received form submission');

        // Server-side validation
        if (!formData.name || !formData.email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields.'
            });
        }

        await appendRecordToSheet(formData);

        return res.status(200).json({
            success: true,
            message: 'Record securely logged to sheet.'
        });

    } catch (error) {
        console.error('Google Sheets API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process submission.'
        });
    }
});

// --------------------------------------------------
// Frontend Routing
// --------------------------------------------------

// Handles root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname));
});


// --------------------------------------------------
// Start Server
// --------------------------------------------------

app.listen(PORT, () => {
    console.log(`CoBAC registration server running on port ${PORT}`);
});