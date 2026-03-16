const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');
const components = [
    'pages/tiktok/TiktokShare.jsx',
    'pages/tiktok/TiktokLike.jsx',
    'pages/tiktok/TiktokFollow.jsx',
    'pages/instagram/InstagramShare.jsx',
    'pages/instagram/InstagramLike.jsx',
    'pages/instagram/InstagramFollow.jsx',
    'pages/instagram/InstagramBlue.jsx',
    'pages/facebook/FacebookShare.jsx',
    'pages/facebook/FacebookMember.jsx',
    'pages/facebook/FacebookLike.jsx',
    'pages/facebook/FacebookFollow.jsx',
    'pages/facebook/FacebookBlue.jsx',
];

components.forEach(comp => {
    const fullPath = path.join(baseDir, comp);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${fullPath} (Not Found)`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Add Import if missing
    if (!content.includes('TwoFactorModal')) {
        content = content.replace(/(import.* OrderSuccessModal.*)/, '$1\nimport TwoFactorModal from \'@/components/common/TwoFactorModal\';');
    }

    // 2. Add States
    if (!content.includes('show2FAModal')) {
        content = content.replace(/(const \[showSuccessModal.*)/, '$1\n  const [show2FAModal, setShow2FAModal] = useState(false);');
    }

    // 3. Modify handleSubmit
    if (!content.includes('code = null')) {
        content = content.replace(/const handleSubmit = async \(\) => {/g, 'const handleSubmit = async (code = null) => {');
    }

    // 4. Inject 2FA code payload inside post body
    content = content.replace(/(action: '(?:createOrder|buyBlue)',[\s\S]*?)(},\s*\{)/, (match, p1, p2) => {
        if (!p1.includes('twoFactorCode: code')) {
            return p1.replace(/,$/, '') + ',\n        twoFactorCode: code\n      ' + p2;
        }
        return match;
    });

    // 5. Inject 2FA handler in response checking
    if (!content.includes('res.data.require2FA')) {
        content = content.replace(/(if \(res\.data\.success\) {)/, 'if (res.data.require2FA) {\n        toast.dismiss(\'order-toast\');\n        setShow2FAModal(true);\n        return;\n      }\n\n      $1');
    }

    // 6. Fix handle submit code parameter injection
    if (!content.includes('<TwoFactorModal')) {
        content = content.replace(/(<OrderSuccessModal[^>]+>)/, '$1\n      <TwoFactorModal \n        isOpen={show2FAModal}\n        onClose={() => setShow2FAModal(false)}\n        onSubmit={(code) => { setShow2FAModal(false); handleSubmit(code); }}\n        isSubmitting={false}\n      />');
    }

    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + comp);
});
