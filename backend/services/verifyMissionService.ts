
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
        // Resize to small width for speed scanning
        const { data, info } = await sharp(buffer)
            .resize({ width: 100 }) // 100px width is enough to find a button
            .raw()
            .toBuffer({ resolveWithObject: true });

        let bluePixels = 0;
        const totalPixels = info.width * info.height;
        const threshold = totalPixels * 0.005; // 0.5% of image (button is small but significant)

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
            if (b > 150 && b > r + 30 && b > g + 30) {
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


        // 3. TIME CHECK (Metadata + Content)
        if (clickedAt) {
             const timeDiff = Date.now() - new Date(clickedAt).getTime();
             
             // A. Minimum Time (Anticheat) - 10 seconds
             if (timeDiff < 10000) { 
                 return { 
                    success: false, 
                    status: 'rejected', 
                    reason: 'Bạn nộp quá nhanh! Vui lòng thực hiện nhiệm vụ thật sự.' 
                };
            }

            // B. Maximum Time (Timeout) - 3 Minutes
            // User requirement: "3p không làm xong ... hủy bỏ ... không được làm lại"
            if (timeDiff > 3 * 60 * 1000) {
                return {
                    success: false,
                    status: 'rejected',
                    reason: 'Quá thời gian làm nhiệm vụ (3 phút). Nhiệm vụ đã bị hủy.'
                };
            }
        }

        // 4. DUPLICATE CHECK (Image Hash)
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const imageHash = hashSum.digest('hex');

        // Check if this hash exists in accepted/approved submissions
        const duplicate = await submissionModel.findOne({ 
            imageHash: imageHash,
            status: { $in: ['approved', 'accepted', 'pending'] } // Prevent re-using proofs
        });

        if (duplicate) {
             return { 
                success: false, 
                status: 'rejected', 
                reason: 'Ảnh này đã được sử dụng trong hệ thống!' 
            };
        }

        // 5. OCR CONTENT CHECK
        console.log(`[OCR] Starting recognition on: ${imagePath}`);
        const worker = await createWorker('eng+vie'); 
        const { data: { text } } = await worker.recognize(imagePath);
        await worker.terminate();

        const cleanText = text.toLowerCase().replace(/\s+/g, ' ').trim();
        console.log(`[OCR] Found Text: "${cleanText}"`);

        // --- REAL TIME CLOCK CHECK (Restored & Improved) ---
        if (clickedAt) {
             const start = new Date(clickedAt);
             
             // Generate valid HH:mm strings for strict comparison
             // Range: -1 minute (drift) to +4 minutes (buffer) relative to clickedAt
             const validTimeStrings: string[] = [];
             for (let i = -1; i <= 4; i++) {
                 const t = new Date(start.getTime() + i * 60000);
                 validTimeStrings.push(`${t.getHours()}:${t.getMinutes().toString().padStart(2, '0')}`);
                 
                 // Add 12h format variations just in case
                 if (t.getHours() > 12) validTimeStrings.push(`${t.getHours()-12}:${t.getMinutes().toString().padStart(2, '0')}`);
                 if (t.getHours() > 12) validTimeStrings.push(`${(t.getHours()-12).toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`);
             }

             console.log(`[OCR] Checking for times: ${validTimeStrings.join(', ')}`);

             // Regex to extract time-like patterns from raw text + normalized text
             // Matches: "12:30", "12;30", "12.30", "12 30", "12030" (risky so sticking to separator)
             const timeRegex = /(\d{1,2})[\s:;.,]+(\d{2})/g;
             
             // Create a "normalized" version of text for better number matching
             const normalizedText = cleanText
                .replace(/[oO]/g, '0')
                .replace(/[lI]/g, '1')
                .replace(/[sS]/g, '5');

             let match;
             let foundValidTime = false;
             const foundTimes: string[] = [];
             
             // Scan Normalized Text
             while ((match = timeRegex.exec(normalizedText)) !== null) {
                 const h = parseInt(match[1] as string); // e.g. 1
                 const m = parseInt(match[2] as string); // e.g. 05
                 
                 // Reconstruct found time
                 const foundTimeStr = `${h}:${m.toString().padStart(2, '0')}`;
                 foundTimes.push(foundTimeStr);

                 // Check against valid set
                 if (validTimeStrings.includes(foundTimeStr)) {
                     foundValidTime = true;
                     break;
                 }
                 
                 // Fallback: Check if this time string appears in original cleanText
                 if (validTimeStrings.some(vt => cleanText.includes(vt))) {
                    foundValidTime = true;
                    break;
                 }
             }

             if (!foundValidTime) {
                 // Final Fallback: Digit-Only Match (Aggressive but safe due to Server Time check)
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
                          reason: `Ảnh không hợp lệ. Thời gian trong ảnh (${uniqueFound.join(', ')}) KHÔNG PHẢI REAL-TIME. Hệ thống yêu cầu ảnh chụp ngay lúc làm nhiệm vụ (${validTimeStrings[0]}...). Vui lòng chụp mới.`
                      };
                  } else {
                      return {
                          success: false,
                          status: 'rejected',
                          reason: `Không tìm thấy đồng hồ trong ảnh. Vui lòng chụp ảnh toàn màn hình có hiện rõ thời gian thực (Realtime).`
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
            
            // B. Text Check (User Identity)
            const keywords = ['bạn', 'you', 'liked']; // strict keywords
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
