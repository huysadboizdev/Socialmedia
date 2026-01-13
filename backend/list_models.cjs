
const https = require('https');
const fs = require('fs');

const apiKey = 'AIzaSyDyHhHXXCmpGjPtRkSwNiP0r5b87z2c66M';

const listModels = (version) => {
    return new Promise((resolve, reject) => {
        https.get(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    fs.writeFileSync(`models_${version}.json`, JSON.stringify(json, null, 2));
                    console.log(`Success ${version}`);
                    resolve(json);
                } catch (e) {
                    console.log(`Failed ${version}: ${body}`);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            console.log(`Error ${version}: ${e.message}`);
            resolve(null);
        });
    });
};

async function run() {
    await listModels('v1');
    await listModels('v1beta');
    console.log('Finished');
}

run();
