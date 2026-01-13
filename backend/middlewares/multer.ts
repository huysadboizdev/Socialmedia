import multer from 'multer';

const storage = multer.diskStorage({
    destination: function(_req, _file, callback){
        callback(null, 'uploads/')
    },
    filename: function(_req, file, callback){
        // Sanitize filename: remove special chars, replace spaces, add timestamp
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        callback(null, Date.now().toString() + '-' + sanitizedName)
    }
})

const upload = multer({ storage });

export default upload;
