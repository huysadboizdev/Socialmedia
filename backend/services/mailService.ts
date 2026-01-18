import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER ?? process.env.EMAIL_USER,
    pass: process.env.MAIL_PASSWORD ?? process.env.EMAIL_PASS,
  },
});

export const sendWithdrawalNotification = async (
  toEmail: string,
  details: {
    bankName: string;
    bankAccount: string;
    amount: number;
    transactionId: string;
  }
) => {
  const emailUser = process.env.MAIL_USER ?? process.env.EMAIL_USER;
  const emailPass = process.env.MAIL_PASSWORD ?? process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("Email credentials missing in .env. Skipping email notification.");
    return { success: false, message: "Email configuration missing" };
  }

  const mailOptions = {
    from: `"HUYTICHXANH" <${emailUser}>`,
    to: toEmail,
    subject: 'Thông Báo Rút Tiền Thành Công',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6610f2; text-align: center;">Yêu Cầu Rút Tiền Đã Được Ghi Nhận</h2>
        <p>Xin chào,</p>
        <p>Hệ thống đã nhận được yêu cầu rút tiền từ ví nhiệm vụ của bạn về tài khoản ngân hàng.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Chi Tiết Giao Dịch:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>Mã Giao Dịch:</strong> ${details.transactionId}</li>
            <li style="margin-bottom: 10px;"><strong>Ngân Hàng:</strong> ${details.bankName}</li>
            <li style="margin-bottom: 10px;"><strong>Số Tài Khoản:</strong> ${details.bankAccount}</li>
            <li style="margin-bottom: 10px;"><strong>Số Tiền Rút:</strong> <span style="color: dimgrey; font-weight: bold;">${details.amount.toLocaleString()} đ</span></li>
            <li style="margin-bottom: 10px;"><strong>Thực Nhận (sau phí 20%):</strong> <span style="color: #28a745; font-weight: bold;">${(details.amount * 0.8).toLocaleString()} đ</span></li>
          </ul>
        </div>

        <p style="color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 5px; border-left: 5px solid #ffeeba;">
          <strong>Lưu ý:</strong> Tiền sẽ được chuyển về tài khoản của bạn trong vòng <strong>24 giờ</strong> làm việc sau khi Admin duyệt.
        </p>

        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không trả lời email này.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendWithdrawalApprovedNotification = async (
  toEmail: string,
  details: {
    bankName: string;
    bankAccount: string;
    amount: number;
    transactionId: string;
  }
) => {
  const emailUser = process.env.MAIL_USER ?? process.env.EMAIL_USER;
  const emailPass = process.env.MAIL_PASSWORD ?? process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("Email credentials missing in .env. Skipping email notification.");
    return { success: false, message: "Email configuration missing" };
  }

  const mailOptions = {
    from: `"HUYTICHXANH" <${emailUser}>`,
    to: toEmail,
    subject: 'Rút Tiền Thành Công',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #28a745; text-align: center;">Yêu Cầu Rút Tiền Đã Được Duyệt</h2>
        <p>Xin chào,</p>
        <p>Admin đã duyệt yêu cầu rút tiền của bạn. Số tiền đã được chuyển về tài khoản ngân hàng của bạn.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Chi Tiết Giao Dịch:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>Mã Giao Dịch:</strong> ${details.transactionId}</li>
            <li style="margin-bottom: 10px;"><strong>Ngân Hàng:</strong> ${details.bankName}</li>
            <li style="margin-bottom: 10px;"><strong>Số Tài Khoản:</strong> ${details.bankAccount}</li>
            <li style="margin-bottom: 10px;"><strong>Số Tiền Rút:</strong> <span style="color: dimgrey; font-weight: bold;">${details.amount.toLocaleString()} đ</span></li>
            <li style="margin-bottom: 10px;"><strong>Thực Nhận:</strong> <span style="color: #28a745; font-weight: bold;">${(details.amount * 0.8).toLocaleString()} đ</span></li>
          </ul>
        </div>

        <p style="color: #004085; background-color: #cce5ff; padding: 10px; border-radius: 5px; border-left: 5px solid #b8daff;">
          <strong>Lưu ý:</strong> Vui lòng kiểm tra tài khoản ngân hàng. Nếu chưa nhận được tiền sau 30 phút, vui lòng liên hệ Admin.
        </p>

        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không trả lời email này.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Approved Email sent: ' + info.response);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending approved email:', error);
    return { success: false, error };
  }
};
