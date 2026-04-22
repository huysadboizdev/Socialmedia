
import { createWorker } from 'tesseract.js';
import crypto from 'crypto';
import fs from 'fs';
import sharp from 'sharp';
import submissionModel from '../models/submissionModel.js';

interface ValidationResult {
    success: boolean;
    status: 'approved' | 'rejected' | 'pending'; // 'pending' if unsure
    reason: string;
    imageHash?: string;
}

/**
 * Check for significant blue color (Facebook Active Like)
 * Heuristic: Active buttons are typically bright blue (#0866FF, #0084FF)
 */
export interface BlueCheckResult {
    hasKeyword: boolean;
    hasBlueIcon: boolean;
    bluePixelCount: number;
}

async function hasBlueLikeText(buffer: Buffer, worker: Tesseract.Worker): Promise<BlueCheckResult> {
    try {
        const metadata = await sharp(buffer).metadata();
        const height = metadata.height || 100;

        // FIX: Smart Crop
        // For small images (already cropped to button), DO NOT CROP anything.
        // For large screenshots, crop top 20% to remove header but keep main content.
        let top = 0;
        let extractHeight = height;

        if (height > 600) {
             top = Math.floor(height * 0.20); 
             extractHeight = height - top;
        }

        const { data, info } = await sharp(buffer)
            .extract({ left: 0, top: top, width: metadata.width || 100, height: extractHeight })
            .resize({ width: 1600 }) // Upscale to 1600px (2x) for sharp text detection on Desktop
            .raw()
            .toBuffer({ resolveWithObject: true });

        const outputData = Buffer.alloc(data.length);

        // 2. Filter: Keep ONLY standard Blue pixels. Make them BLACK. Make others WHITE.
        // This isolates the Blue "Thích"/"Like" text or Blue "Like" icon.
        let bluePixelCount = 0;
        for (let i = 0; i < data.length; i += 3) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];

            const rVal = r ?? 0;
            const gVal = g ?? 0;
            const bVal = b ?? 0;

            // Relaxed Blue Definition to catch anti-aliased text or lighter blue
            // b > 110 (was 130)
            // difference > 15 (was 30)
            if (bVal > 110 && bVal > rVal + 15 && bVal > gVal + 15) {
                 bluePixelCount++;
                 // Keep Blue (Black for OCR)
                 outputData[i] = 0;
                 outputData[i+1] = 0;
                 outputData[i+2] = 0;
            } else {
                 // Wipe Non-Blue (White)
                 outputData[i] = 255;
                 outputData[i+1] = 255;
                 outputData[i+2] = 255;
            }
        }

        const blueMaskBuffer = await sharp(outputData, { raw: { width: info.width, height: info.height, channels: 3 } })
            .png()
            .toBuffer();

        // 3. OCR on the Blue Mask
        const { data: { text } } = await worker.recognize(blueMaskBuffer);
        const cleanText = text.toLowerCase();
        
        console.log(`[BLUE-OCR] Extracted Text from Blue Layer: "${cleanText.replace(/\s+/g, ' ').trim().substring(0, 50)}..."`);
        console.log(`[BLUE-OCR] Blue Pixel Count: ${bluePixelCount}`);

        const keywords = ['thích', 'like', 'liked'];
        const hasKeyword = keywords.some(k => cleanText.includes(k));

        const hasBlueIcon = bluePixelCount > 1500 && bluePixelCount < 50000;

        return { hasKeyword, hasBlueIcon, bluePixelCount };

    } catch (e) {
        console.error("[BLUE-OCR] Check Error:", e);
        return { hasKeyword: false, hasBlueIcon: false, bluePixelCount: 0 };
    }
}


/**
 * Verify mission proof image without AI Vision
 */
export const verifyMissionProof = async (
    imagePath: string,
    missionType: string,
    clickedAt?: Date
): Promise<ValidationResult> => {
    try {
        // 1. READ FILE BUFFER (Fix for image-size and optimization)
        const fileBuffer = fs.readFileSync(imagePath);


        // 4. DUPLICATE CHECK (Image Hash)
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const imageHash = hashSum.digest('hex');

        // Check if this hash exists in accepted/approved submissions
        const duplicate = await submissionModel.findOne({ 
            imageHash: imageHash,
            status: { $in: ['approved', 'accepted', 'pending'] } 
        });

        if (duplicate) {
             return { 
                success: false, 
                status: 'rejected', 
                reason: 'Ảnh này đã được sử dụng trong hệ thống!' 
            };
        }

        // 5. OCR EXTENSIVE CHECK (Full + Cropped)
        console.log(`[OCR] Starting recognition on: ${imagePath}`);
        const worker = await createWorker('eng+vie'); 
        
        // Pass 1: Full Image
        const { data: { text: fullText } } = await worker.recognize(imagePath);
        let combinedText = fullText;

        // Pass 2: Bottom-Right Crop (For Windows/Desktop Taskbar Time)
        // Crop last 25% width and last 15% height
        try {
            const metadata = await sharp(fileBuffer).metadata();
            if (metadata.width && metadata.height) {
                // A. Bottom Right (Taskbar)
                const cropWidth = Math.floor(metadata.width * 0.25);
                const cropHeight = Math.floor(metadata.height * 0.15);
                const left = metadata.width - cropWidth;
                const top = metadata.height - cropHeight;

                const cropBuffer = await sharp(fileBuffer)
                    .extract({ left, top, width: cropWidth, height: cropHeight })
                    .resize({ width: cropWidth * 2 }) // Upscale 2x
                    .grayscale()
                    .normalize()
                    .toBuffer();
                
                const { data: { text: cropText } } = await worker.recognize(cropBuffer);
                console.log(`[OCR] Cropped Text (Bottom-Right): "${cropText.trim()}"`);
                combinedText += " " + cropText;

                // B. Top Right (Calendar Widget / Big Clock)
                // Often widgets are in the top-right or center-right.
                // Let's grab the top-right 30% area.
                // B. Top Right (Calendar Widget / Big Clock)
                // Often widgets are in the top-right or center-right.
                // Let's grab the top-right 50% area to be safe for wide widgets.
                const trWidth = Math.floor(metadata.width * 0.50);
                const trHeight = Math.floor(metadata.height * 0.35);
                const trLeft = metadata.width - trWidth;
                const trTop = 0;

                const trBuffer = await sharp(fileBuffer)
                     .extract({ left: trLeft, top: trTop, width: trWidth, height: trHeight })
                     .resize({ width: trWidth * 2 }) // Upscale 2x
                     .grayscale()
                     .normalize()
                     .toBuffer();
                
                const { data: { text: trText } } = await worker.recognize(trBuffer);
                console.log(`[OCR] Cropped Text (Top-Right): "${trText.trim()}"`);
                combinedText += " " + trText;

                // C. Top Left (Mobile Status Bar - iPhone/Android)
                // Grab top-left 40% width and top 15% height
                const tlWidth = Math.floor(metadata.width * 0.40);
                const tlHeight = Math.floor(metadata.height * 0.15);
                const tlLeft = 0;
                const tlTop = 0;

                const tlBuffer = await sharp(fileBuffer)
                     .extract({ left: tlLeft, top: tlTop, width: tlWidth, height: tlHeight })
                     .resize({ width: tlWidth * 2 }) // Upscale 2x
                     .grayscale()
                     .normalize()
                     .toBuffer();
                
                const { data: { text: tlText } } = await worker.recognize(tlBuffer);
                console.log(`[OCR] Cropped Text (Top-Left): "${tlText.trim()}"`);
                combinedText += " " + tlText;

            }
        } catch (cropError) {
            console.error("[OCR] Crop Error:", cropError);
        }

        // await worker.terminate(); // Keep worker alive for Blue Text Check

        // Remove am/pm to simplify number parsing, but keep logic if needed later
        const cleanText = combinedText.toLowerCase()
            .replace(/am|pm/g, '') 
            .replace(/\s+/g, ' ')
            .trim();
        console.log(`[OCR] Final Combined Text: "${cleanText}"`);

        // 6. REAL TIME CLOCK CHECK
        if (clickedAt) {
             const start = new Date(clickedAt);
             
             // Timezone Adjustment: Ensure we check against VIETNAM TIME (UTC+7)
             const getVNTime = (d: Date) => {
                 return d.toLocaleTimeString('en-GB', { 
                     timeZone: 'Asia/Ho_Chi_Minh', 
                     hour: '2-digit', 
                     minute: '2-digit' 
                 }); 
             };

             const validTimeStrings: string[] = [];
             // Range: -1 minute (drift) to +3 minutes (strict window per user request)
             for (let i = -1; i <= 3; i++) {
                 const t = new Date(start.getTime() + i * 60000);
                 const vnTime = getVNTime(t); // e.g., "09:26" or "15:27"
                 validTimeStrings.push(vnTime);
                 
                 const [hStr, mStr] = vnTime.split(':');
                 const h = parseInt(hStr ?? '0');

                 // Add unpadded hour format: "09:26" -> "9:26"
                 if (h < 10) {
                     validTimeStrings.push(`${h}:${mStr}`);
                 }

                 // Add 12h format variations
                 if (h > 12) validTimeStrings.push(`${h-12}:${mStr}`);
                 if (h > 12 && h-12 < 10) validTimeStrings.push(`${h-12}:${mStr}`); // 3:30
                 if (h > 12) validTimeStrings.push(`${(h-12).toString().padStart(2, '0')}:${mStr}`); // 03:30
             }

             console.log(`[OCR] Checking for times (VN): ${validTimeStrings.join(', ')}`);

             // REGEX: Allow more separators (dot, comma, dash, space, quote)
             const timeRegex = /(\d{1,2})[\s:;.,'"-]+(\d{2})/g;
             
             const normalizedText = cleanText
                .replace(/[oO]/g, '0')
                .replace(/[lI]/g, '1')
                .replace(/[sS]/g, '5');

             let match;
             let foundValidTime = false;
             const foundTimes: string[] = [];
             
             // 1. Check Standard Separated Times
             while ((match = timeRegex.exec(normalizedText)) !== null) {
                 const hStr = match[1] ?? '0';
                 const mStr = match[2] ?? '0';
                 const h = parseInt(hStr, 10);
                 const m = parseInt(mStr, 10);
                 
                 const foundTimeStr = `${h}:${m.toString().padStart(2, '0')}`;
                 foundTimes.push(foundTimeStr);

                 if (validTimeStrings.includes(foundTimeStr)) {
                     foundValidTime = true;
                     break;
                 }
                 // Fuzzy match (contains)
                 if (validTimeStrings.some(vt => cleanText.includes(vt))) {
                    foundValidTime = true;
                    break;
                 }
             }

             // 2. Check Compact Times (e.g. "1012" found in text)
             // ONLY if we verify it against our expected list to avoid false positives (years/likes)
             if (!foundValidTime) {
                 const digitsOnly = normalizedText.replace(/\D/g, ''); 
                 
                 const digitMatches = validTimeStrings.some(vt => {
                     // vt is "10:12" -> "1012"
                     const vtDigits = vt.replace(/\D/g, ''); 
                     
                     // Check if "1012" exists in the digits stream
                     // AND check if "1012" exists as a whole word in normalized text (safer)
                     // converting normalizedText to space-separated digits might be better
                     
                     if (digitsOnly.includes(vtDigits)) {
                         // Double check: ensure it's not part of "2026" (Year)
                         // e.g. Year 2026 -> 2026. If time is 20:26 -> match. 
                         // But here time is 10:12 -> 1012. Year is 2026. Safe.
                         return true;
                     }
                     return false;
                 });

                 if (digitMatches) foundValidTime = true;
             }
             
             if (!foundValidTime) {
                   const uniqueFound = [...new Set(foundTimes)].slice(0, 5); 
                   console.log(`[OCR] Time Check Failed. Digits: ${normalizedText.replace(/\D/g, '')} | Expected: ${validTimeStrings.map(t=>t.replace(/\D/g,'')).join(',')}`);
                   
                       if (uniqueFound.length > 0) {
                           await worker.terminate();
                           return {
                               success: false,
                               status: 'rejected',
                               reason: `Ảnh không hợp lệ. Thời gian trong ảnh (${uniqueFound.join(', ')}) KHÔNG PHẢI REAL-TIME. Hệ thống yêu cầu ảnh chụp trong khoảng ${validTimeStrings[0]} - ${validTimeStrings[validTimeStrings.length-1]} (VN Time).`
                           };
                       } else {
                           await worker.terminate();
                           return {
                               success: false,
                               status: 'rejected',
                               reason: `Không tìm thấy đồng hồ trong ảnh. Vui lòng chụp ảnh toàn màn hình có hiện rõ thời gian thực.`
                           };
                       }
             }
        }
        // -------------------------------------
        // -----------------------------

        let isValidContent = false;
        let rejectReason = "";

        if (missionType === 'like') {
            // A. Check for Blue Text (Blue Mask OCR) - Gate 1
            // This verifies that "Thích"/"Like" is actually colored BLUE.
            // Using the worker from the main scope
            const blueCheck = await hasBlueLikeText(fileBuffer, worker);
            const hasBlueText = blueCheck.hasKeyword;
            
            // B. Check for Strong Keywords (Standard OCR)
            // Added "bạn," (comma is important) to catch "Bạn, [Name]..." status line which confirms user like.
            const strongKeywords = ['đã thích', 'liked', 'you liked', 'bạn và', 'reaction', 'bạn,']; 
            const textLower = cleanText.toLowerCase();
            const hasStrongKeyword = strongKeywords.some(k => textLower.includes(k));

            // C. Compound Check (Contextual Verification)
            // "Bạn" + "thích" OR "Bạn" + "người khác" OR "Bạn" + "và" matches "Bạn, X và Y người khác đã thích"
            // Also handles unaccented cases (OCR issues)
            // C. Compound Check (Contextual Verification)
            // "Bạn" + "thích" OR "Bạn" + "người khác" OR "Bạn" + "và" matches "Bạn, X và Y người khác đã thích"
            // Also handles unaccented cases (OCR issues)
            
            // Replaced Regex with simple substring checks for robustness against concatenated OCR (e.g. "Banva")
            // "bạn và" or "bạn," are very specific to the status line.
            const hasBanPrefix = 
                textLower.includes('bạn,') || textLower.includes('ban,') ||
                textLower.includes('bạn và') || textLower.includes('ban va') ||
                textLower.includes('bạn ') || textLower.includes('ban '); // Space is safe if "bạn" is a word

            const hasCompoundKeyword = hasBanPrefix && (
                textLower.includes('thích') || 
                textLower.includes('người khác') || 
                textLower.includes('và') ||
                textLower.includes('thich') || // Unaccented
                textLower.includes('nguoi khac') || 
                textLower.includes('va') ||
                textLower.includes('liked') 
            );

            // D. Is it a Facebook post? (Fallback to avoid false blue positives on random images)
            const fbKeywords = ['bình luận', 'comment', 'chia sẻ', 'share', 'most relevant', 'phù hợp nhất', 'tất cả bình luận'];
            const isFbPost = fbKeywords.some(k => textLower.includes(k));

            if (hasBlueText) {
                 isValidContent = true;
                 console.log("[VERIFY] Blue Like Text Detected (Mask OCR). Approved.");
            } else if (hasStrongKeyword) {
                 isValidContent = true; 
                 console.log("[VERIFY] Strong keyword detected. Approved.");
            } else if (hasCompoundKeyword) {
                 isValidContent = true;
                 console.log("[VERIFY] Compound Context detected (Bạn/Ban + ...). Approved.");
            } else if (blueCheck.hasBlueIcon && isFbPost) {
                 isValidContent = true;
                 console.log(`[VERIFY] Blue Like Icon Detected (Pixels: ${blueCheck.bluePixelCount}) in FB Post. Approved.`);
            } else {
                 rejectReason = 'Nút Like chưa chuyển sang màu xanh (Chưa hiển thị active) HOẶC không tìm thấy nút Like.';
            }

        } else if (missionType === 'follow') {
             const keywords = ['follow', 'theo dõi', 'đang follow', 'following', 'đã follow', 'follow back', 'nhắn tin'];
             if (keywords.some(k => cleanText.includes(k))) {
                isValidContent = true;
            } else {
                 rejectReason = 'Không tìm thấy trạng thái "Đang Follow" hoặc tương tự.';
            }
        } else if (missionType === 'comment') {
            const keywords = ['bình luận', 'comment', 'trả lời', 'reply', 'viết bình luận'];
             if (keywords.some(k => cleanText.includes(k))) {
                isValidContent = true;
            } else {
                 rejectReason = 'Không tìm thấy phần bình luận.';
            }
        } else {
             isValidContent = true; 
        }

        if (!isValidContent) {
            console.log(`[OCR] Failed. Reason: ${rejectReason}`);
            await worker.terminate();
            return {
                success: false,
                status: 'rejected',
                reason: rejectReason
            };
        }

        await worker.terminate();
        return {
            success: true,
            status: 'approved', 
            reason: 'Duyệt thành công (Real-time + Visual + Text Verified)',
            imageHash: imageHash
        };

    } catch (_error) {
        console.error("Verification Error:", _error);
        return { 
            success: false, 
            status: 'pending', 
            reason: 'Lỗi hệ thống kiểm tra, chuyển sang duyệt tay.' 
        };
    }
}

/**
 * Helper to compute hash for storage
 */
export const computeImageHash = (filePath: string): string => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    } catch (_e) {
        return "";
    }
}
