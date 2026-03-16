import express from 'express';
import { generate2FA, verifySetup2FA, disable2FA, verify2FACode } from '../controller/auth2faController.js';
import { authUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authUser); // Require authentication for all 2FA routes

router.post('/generate', generate2FA);
router.post('/verify-setup', verifySetup2FA);
router.post('/disable', disable2FA);
router.post('/verify', verify2FACode);

export default router;
