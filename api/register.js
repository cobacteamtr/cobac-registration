import { google } from 'googleapis';
import path from 'path';
import process from 'process';

export default async function handler(req, res) {
    // Enable CORS headers so your frontend can talk to it
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const formData = req.body;

        // Server-side validation
        if (!formData.name || !formData.email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields.'
            });
        }

        // Setup Google Sheets Authentication
        // On Vercel, it's best to read credentials via file or environment variables. 
        // Placing credentials.json in the project root works seamlessly with path.join.
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });
        const spreadsheetId = '1jT7eP5uIaNcWDqOy8avoz938Dk00ZgUFVY-TLiMPdWo';

        const requestBody = {
            values: [
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
            ]
        };

        await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A1:K',
            valueInputOption: 'USER_ENTERED',
            requestBody
        });

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
}