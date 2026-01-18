
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
async function hasBlueLikeButton(buffer: Buffer): Promise<boolean> {
    try {
        // Resize to width 500 for better detail on desktop screenshots
        const { data, info } = await sharp(buffer)
            .resize({ width: 500 }) 
            .raw()
            .toBuffer({ resolveWithObject: true });

        let bluePixels = 0;
        const totalPixels = info.width * info.height;
        // Desktop: Button is tiny relative to screen. Mobile: Button is large.
        // 0.1% of pixels is safe.
        const threshold = totalPixels * 0.001; 

        for (let i = 0; i < data.length; i += 3) { // limit 3 channels (r,g,b) usually
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];

            // Facebook Blue targets roughly:
            // Modern: R:8 G:102 B:255 (#0866FF)
            // Messenger: R:0 G:132 B:255 (#0084FF)
            // Classic: R:24 G:119 B:242 (#1877F2)
            
            // Logic: Blue must be significantly higher than Red and Green
            // And Blue component should be high (> 150)
            const rVal = r ?? 0;
            const gVal = g ?? 0;
            const bVal = b ?? 0;

            if (bVal > 140 && bVal > rVal + 30 && bVal > gVal + 30) {
                 bluePixels++;
            }
        }

        console.log(`[VISUAL] Blue Pixels: ${bluePixels} / ${threshold} needed`);
        return bluePixels > threshold;
    } catch (e) {
        console.error("[VISUAL] Check Error:", e);
        return false; // Fail safe
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
                const trWidth = Math.floor(metadata.width * 0.35);
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
            }
        } catch (cropError) {
            console.error("[OCR] Crop Error:", cropError);
        }

        await worker.terminate();

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
             // Range: -2 minute (drift) to +5 minutes (buffer)
             for (let i = -2; i <= 5; i++) {
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

             const timeRegex = /(\d{1,2})[\s:;.,]+(\d{2})/g;
             
             const normalizedText = cleanText
                .replace(/[oO]/g, '0')
                .replace(/[lI]/g, '1')
                .replace(/[sS]/g, '5');

             let match;
             let foundValidTime = false;
             const foundTimes: string[] = [];
             
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
                 if (validTimeStrings.some(vt => cleanText.includes(vt))) {
                    foundValidTime = true;
                    break;
                 }
             }

             if (!foundValidTime) {
                 const digitsOnly = normalizedText.replace(/\D/g, ''); 
                 const digitMatches = validTimeStrings.some(vt => {
                     const vtDigits = vt.replace(/\D/g, ''); 
                     return digitsOnly.includes(vtDigits);
                 });
                 if (digitMatches) foundValidTime = true;
             }

             if (!foundValidTime) {
                   const uniqueFound = [...new Set(foundTimes)].slice(0, 5); 
                   console.log(`[OCR] Time Check Failed. Digits: ${normalizedText.replace(/\D/g, '')} | Expected: ${validTimeStrings.map(t=>t.replace(/\D/g,'')).join(',')}`);
                   
                   if (uniqueFound.length > 0) {
                       return {
                           success: false,
                           status: 'rejected',
                           reason: `Ảnh không hợp lệ. Thời gian trong ảnh (${uniqueFound.join(', ')}) KHÔNG PHẢI REAL-TIME. Hệ thống yêu cầu ảnh chụp lúc ${validTimeStrings[0]} (VN Time).`
                       };
                   } else {
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
            // A. Visual Check (Blue Button)
            const isBlue = await hasBlueLikeButton(fileBuffer);
            
            // B. Text Check (User Identity or Action)
            const keywords = ['bạn', 'you', 'liked', 'thích', 'đã thích', 'like']; 
            const textLower = cleanText.toLowerCase();
            const hasUserRef = keywords.some(k => textLower.includes(k));

            // LOGIC UPDATE:
            // If Blue Button is found + Time Check passed -> We are confident checking "Like".
            // The word "Bạn" is sometimes missed by OCR in complex backgrounds.
            // So: Success if (Blue) OR (Text "Bạn")
            
            if (isBlue) {
                 isValidContent = true; // Visual proof is strong enough
                 if (!hasUserRef) {
                     console.log("[VERIFY] Blue Button detected but 'Bạn' missing. Approving based on Visual.");
                 }
            } else if (hasUserRef) {
                 isValidContent = true; // Text proof found even if visual failed (e.g. dark mode weirdness)
            } else {
                 rejectReason = 'Không tìm thấy nút Like màu xanh HOẶC chữ "Bạn" trong ảnh.';
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
            return {
                success: false,
                status: 'rejected',
                reason: rejectReason
            };
        }

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
