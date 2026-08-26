import { google } from 'googleapis';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const formData = req.body;

        console.log('Received form submission on Vercel');

        // Server-side validation
        if (!formData.name || !formData.email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields.'
            });
        }

        // Google Sheets Authentication
        const auth = new google.auth.GoogleAuth({
            credentials: process.env.GOOGLE_CREDENTIALS_JSON ?
                JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON) : undefined,

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

        // Find the next available row
        const existingData =
            await googleSheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Sheet1!A:A'
            });

        const rows = existingData.data.values || [];


        const nextRow = Math.max(rows.length + 1, 2);

        console.log(`Next available row: ${nextRow}`);

        // Write the new registration
        const response =
            await googleSheets.spreadsheets.values.update({
                spreadsheetId,
                range: `Sheet1!A${nextRow}:K${nextRow}`,
                valueInputOption: 'USER_ENTERED',

                requestBody: {
                    values
                }
            });

        // Log Google Sheets response
        console.log('Google Sheets update response:', {
            updatedRange: response.data.updatedRange,
            updatedRows: response.data.updatedRows,
            updatedColumns: response.data.updatedColumns,
            updatedCells: response.data.updatedCells
        });

        // Success response
        return res.status(200).json({
            success: true,
            message: 'Record securely logged to sheet.',
            row: nextRow
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
}