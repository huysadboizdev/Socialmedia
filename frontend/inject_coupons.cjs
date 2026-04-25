const fs = require('fs');
const path = require('path');

const pagesDir = 'd:/FNPRJ/Socialmedia/frontend/src/pages';
const subDirs = ['facebook', 'instagram', 'premium'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Add import if not exists
    if (!content.includes('ActiveCouponsList')) {
        content = content.replace(
            /(import .* from '@\/components\/common\/ServiceOrderList';|import .* from '@\/hooks\/useCoupon';)/,
            `$1\nimport ActiveCouponsList from '@/components/common/ActiveCouponsList';`
        );
        
        // Inject component
        content = content.replace(
            /(\{isCouponApplied && <p className=".*?">Đã áp dụng mã giảm giá!<\/p>\})/g,
            `$1\n                  <ActiveCouponsList onApply={(code) => setFormData(prev => ({...prev, discount: code}))} appliedCouponCode={formData.discount} />`
        );
        
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Updated: ' + filePath);
    }
}

subDirs.forEach(dir => {
    const fullDir = path.join(pagesDir, dir);
    if (fs.existsSync(fullDir)) {
        const files = fs.readdirSync(fullDir);
        files.forEach(file => {
            if (file.endsWith('.jsx') && !file.includes('FacebookLike')) {
                processFile(path.join(fullDir, file));
            }
        });
    }
});
