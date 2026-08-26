import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3327;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));



// GOOGLE SHEETS

async function appendRecordToSheet(formData) {

    // Authentication

    const auth = new google.auth.GoogleAuth({
        credentials: process.env.GOOGLE_CREDENTIALS_JSON ?
            JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON) : undefined,

        keyFile: process.env.GOOGLE_CREDENTIALS_JSON ?
            undefined : path.join(__dirname, 'credentials.json'),

        scopes: [
            'https://www.googleapis.com/auth/spreadsheets'
        ]
    });

    const client = await auth.getClient();

    const googleSheets = google.sheets({
        version: 'v4',
        auth: client
    });

    const spreadsheetId =
        '1jT7eP5uIaNcWDqOy8avoz938Dk00ZgUFVY-TLiMPdWo';


    // Prepare registration data

    const values = [
        [
            formData.name,
            formData.email,
            formData.phone || '',
            formData.cityCountry || '',
            formData.job || '',
            formData.company || '',
            formData.invoiceAddress || '',
            formData.membership || '',
            formData.source || '',
            formData.photoConsent ? 'Yes' : 'No',
            new Date().toISOString()
        ]
    ];


    // Find existing rows

    const existingData =
        await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:A'
        });

    const rows = existingData.data.values || [];


    // Calculate next row



    const nextRow = Math.max(rows.length + 1, 2);

    console.log(
        `Writing registration to Sheet1 row ${nextRow}`
    );


    // Write registration

    const response =
        await googleSheets.spreadsheets.values.update({
            spreadsheetId,

            range: `Sheet1!A${nextRow}:K${nextRow}`,

            valueInputOption: 'USER_ENTERED',

            requestBody: {
                values
            }
        });


    // Log response

    console.log('Google Sheets update response:', {
        updatedRange: response.data.updatedRange,
        updatedRows: response.data.updatedRows,
        updatedColumns: response.data.updatedColumns,
        updatedCells: response.data.updatedCells
    });

    return response;
}


// FORM SUBMISSION

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


        // Save to Google Sheets

        const response =
            await appendRecordToSheet(formData);

        // Success

        return res.status(200).json({

            success: true,

            message: 'Record securely logged to sheet.',

            updatedRange: response.data.updatedRange

        });

    } catch (error) {

        console.error(
            'Google Sheets API Error:',
            error?.response?.data || error
        );

        return res.status(500).json({
            success: false,
            error: 'Failed to process submission.'
        });
    }
});


// FRONTEND ROUTING

app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'index.html')
    );

});


// START SERVER

app.listen(PORT, () => {

    console.log(
        `CoBAC registration server running on port ${PORT}`
    );

});