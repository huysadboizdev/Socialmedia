declare module 'nodemailer' {
    export interface SendMailOptions {
        from?: string;
        to?: string;
        subject?: string;
        text?: string;
        html?: string;
    }

    export interface SentMessageInfo {
        messageId: string;
        envelope: { from: string; to: string[] };
        accepted: string[];
        rejected: string[];
        pending: string[];
        response: string;
    }

    export interface Transporter {
        sendMail(mailOptions: SendMailOptions): Promise<SentMessageInfo>;
        sendMail(mailOptions: SendMailOptions, callback: (err: Error | null, info: SentMessageInfo) => void): void;
    }

    export interface TransportOptions {
        service?: string;
        auth?: {
            user?: string;
            pass?: string;
        };
        host?: string;
        port?: number;
        secure?: boolean;
        
        [key: string]: unknown;
    }

    export function createTransport(transport?: TransportOptions, defaults?: unknown): Transporter;

    const nodemailer: {
        createTransport(transport?: TransportOptions, defaults?: unknown): Transporter;
    };
    export default nodemailer;
}
