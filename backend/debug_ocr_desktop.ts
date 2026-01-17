
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';

const IMG_0_PATH = "C:/Users/Huy/.gemini/antigravity/brain/fdc4961f-6e53-4182-bf76-3a2f59c136ce/uploaded_image_1768614510935.png";

async function run() {
    console.log("Analyzing Desktop Image:", IMG_0_PATH);
    const worker = await createWorker('eng+vie');
    const fileBuffer = fs.readFileSync(IMG_0_PATH);

    // 1. Full Image (might be slow/fail)
    // const { data: { text: fullText } } = await worker.recognize(IMG_0_PATH);
    // console.log("--- FULL IMAGE TEXT ---");
    // console.log(fullText.substring(0, 500) + "..."); 

    // 2. Bottom-Right Crop (Taskbar)
    const metadata = await sharp(fileBuffer).metadata();
    if (metadata.width && metadata.height) {
        console.log(`Dimensions: ${metadata.width} x ${metadata.height}`);
        
        // Taskbar Crop
        const cropWidth = Math.floor(metadata.width * 0.25);
        const cropHeight = Math.floor(metadata.height * 0.15);
        const left = metadata.width - cropWidth;
        const top = metadata.height - cropHeight;
        
        console.log("Processing Bottom-Right Crop...");
        const cropBuffer = await sharp(fileBuffer)
            .extract({ left, top, width: cropWidth, height: cropHeight })
            .resize({ width: cropWidth * 2 }) // Upscale 2x
            .grayscale() // Remove color noise
            .normalize() // Improve contrast
            .toBuffer();
        
        const { data: { text: cropText } } = await worker.recognize(cropBuffer);
        console.log("--- BOTTOM-RIGHT CROP (Processed) ---");
        console.log(cropText.trim());

        // Top-Right Crop (Widget?)
        const trWidth = Math.floor(metadata.width * 0.35);
        const trHeight = Math.floor(metadata.height * 0.35);
        const trLeft = metadata.width - trWidth;
        const trTop = 0;

        console.log("Processing Top-Right Crop...");
        const trBuffer = await sharp(fileBuffer)
             .extract({ left: trLeft, top: trTop, width: trWidth, height: trHeight })
             .resize({ width: trWidth * 2 }) // Upscale 2x
             .grayscale()
             .normalize()
             .toBuffer();

        const { data: { text: trText } } = await worker.recognize(trBuffer);
        console.log("--- TOP-RIGHT CROP (Processed) ---");
        console.log(trText.trim());
    }

    await worker.terminate();
}

run();
