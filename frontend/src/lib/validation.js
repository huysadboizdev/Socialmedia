export const validateGmail = (email) => {
    if (!email) return false;
    return email.toLowerCase().endsWith('@gmail.com');
};

export const validateLink = (link, platform) => {
    if (!link) return false;
    
    let pattern;
    switch (platform.toLowerCase()) {
        case 'facebook':
            pattern = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.*$/i;
            break;
        case 'instagram':
            pattern = /^(https?:\/\/)?(www\.)?(instagram\.com)\/.*$/i;
            break;
        case 'tiktok':
            pattern = /^(https?:\/\/)?(www\.)?(tiktok\.com|vt\.tiktok\.com)\/.*$/i;
            break;
        default:
            return true; // If platform is unknown, skip specific check but assume true if not empty
    }
    
    return pattern.test(link);
};
