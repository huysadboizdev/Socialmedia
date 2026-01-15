
import { createWorker } from 'tesseract.js';
import path from 'path';

const imagePath = 'C:/Users/Huy/.gemini/antigravity/brain/57a16f21-e72e-413b-841f-d06ee6b2e309/uploaded_image_1768486136971.png';

async function runDebug() {
    console.log(`Analyzing: ${imagePath}`);
    const worker = await createWorker('eng+vie');
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();

    const cleanText = text.toLowerCase().replace(/\s+/g, ' ').trim();
    console.log("--- CLEAN TEXT ---");
    console.log(cleanText);
    console.log("------------------");

    const normalizedText = cleanText
        .replace(/[oO]/g, '0')
        .replace(/[lI]/g, '1')
        .replace(/[sS]/g, '5');

    console.log("--- NORMALIZED TEXT ---");
    console.log(normalizedText);
    console.log("-----------------------");

    const timeRegex = /(\d{1,2})[\s:;.,]+(\d{2})/g;
    let match;
    while ((match = timeRegex.exec(normalizedText)) !== null) {
        console.log(`MATCH: "${match[0]}" -> H:${match[1]} M:${match[2]}`);
    }
}

runDebug();
