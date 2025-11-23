const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
    console.error("Usage: node test-heygen.js <YOUR_API_KEY>");
    process.exit(1);
}

console.log("Testing API Key:", apiKey.slice(0, 5) + "...");

const options = {
    hostname: 'api.heygen.com',
    path: '/v2/voices',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
    }
};

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log("SUCCESS! Found voices:");
            const json = JSON.parse(data);
            // Filter for male voices and print a few
            const maleVoices = json.data.voices.filter(v => v.gender === 'male').slice(0, 10);
            console.log(JSON.stringify(maleVoices, null, 2));
        } else {
            console.error("FAILED to list voices.");
            console.error("Response:", data);
        }
    });
});

req.on('error', (error) => {
    console.error("Error:", error);
});

req.end();
