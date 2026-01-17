
import { verifyMissionProof } from './services/verifyMissionService';
import path from 'path';

// Absolute paths to the uploaded images (from user metadata)
const IMG_0_PATH = "C:/Users/Huy/.gemini/antigravity/brain/fdc4961f-6e53-4182-bf76-3a2f59c136ce/uploaded_image_0_1768613202215.png";
const IMG_1_PATH = "C:/Users/Huy/.gemini/antigravity/brain/fdc4961f-6e53-4182-bf76-3a2f59c136ce/uploaded_image_1_1768613202215.png";

async function runTest() {
    console.log("=== STARTING REAL-TIME VERIFICATION TEST ===");

    // TEST CASE 1: Desktop Image (Time: 9:26 AM)
    console.log("\n--- Testing Image 0 (Desktop, Expecting ~9:26 AM) ---");
    const date0 = new Date();
    date0.setHours(9, 26, 0, 0); // Simulate clickedAt 9:26 AM
    
    try {
        const result0 = await verifyMissionProof(IMG_0_PATH, 'like', date0);
        console.log("Result 0:", JSON.stringify(result0, null, 2));
    } catch (e) {
        console.error("Error 0:", e);
    }

    // TEST CASE 2: Mobile Image (Time: 15:27)
    console.log("\n--- Testing Image 1 (Mobile, Expecting ~15:27) ---");
    const date1 = new Date();
    date1.setHours(15, 27, 0, 0); // Simulate clickedAt 15:27
    
    try {
        const result1 = await verifyMissionProof(IMG_1_PATH, 'like', date1);
        console.log("Result 1:", JSON.stringify(result1, null, 2));
    } catch (e) {
        console.error("Error 1:", e);
    }
}

runTest();
