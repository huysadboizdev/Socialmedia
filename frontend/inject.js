const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, 'src', 'pages', 'tiktok'),
    path.join(__dirname, 'src', 'pages', 'instagram'),
    path.join(__dirname, 'src', 'pages', 'facebook')
];

function inject(file) {
    console.log("Processing: " + file);
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes("action: 'createOrder'")) {
        console.log("Skipped: No createOrder in " + file);
        return;
    }
    if (content.includes("OrderSuccessModal")) {
        console.log("Skipped: Already injected " + file);
        return;
    }

    try {
        // 1. Add import
        content = content.replace("import React, { useState, useEffect } from 'react';", 
        "import React, { useState, useEffect } from 'react';\nimport OrderSuccessModal from '@/components/common/OrderSuccessModal';");

        // 2. Add state
        content = content.replace("const [loading, setLoading] = useState(true);",
        "const [loading, setLoading] = useState(true);\n  const [showSuccessModal, setShowSuccessModal] = useState(false);");

        // 3. Replace toast success
        content = content.replace(/toast\.success\([^;]*\);/g, (match) => {
            if (match.includes("Tạo đơn hàng thành công")) {
                 return "setShowSuccessModal(true);";
            }
            return match;
        });

        // 4. Add modal component before the very last </div>
        const lastDivIndex = content.lastIndexOf("</div>");
        if (lastDivIndex !== -1) {
            const before = content.substring(0, lastDivIndex);
            const after = content.substring(lastDivIndex);
            content = before + "\n      <OrderSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />\n    " + after;
        } else {
            console.log("Warning: No </div> found in " + file);
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log("Success: Injected into " + file);
    } catch (e) {
        console.log("Error processing " + file + ":", e);
    }
}

for (const dir of targetDirs) {
    console.log("Checking dir: " + dir);
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
        for (const f of files) {
            inject(path.join(dir, f));
        }
    } else {
        console.log("Dir not found: " + dir);
    }
}
