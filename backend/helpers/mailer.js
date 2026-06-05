const { transporter } = require('./mailer');

const { frontendUrl } = require('../config/env');

const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Password - LAPAK',
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <tr>
          <td style="background-color: #4CAF50; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">LAPAK</h2>
            <p style="color: #e8f5e9; margin: 5px 0 0;">Business Management</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 20px;">
            <h3 style="color: #333; margin-top: 0;">Reset Password</h3>
            <p style="color: #666; line-height: 1.5;">Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk melanjutkan:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
              <tr>
                <td align="center">
                  <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
                </td>
              </tr>
            </table>
            <p style="color: #999; font-size: 12px; line-height: 1.4;">
              Atau salin link berikut: <br>
              <span style="color: #4CAF50; word-break: break-all;">${resetLink}</span>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f9f9f9; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #999; font-size: 11px; margin: 0;">&copy; 2026 LAPAK. All rights reserved.</p>
          </td>
        </tr>
      </table>
    `,
  });
};

module.exports = { sendResetPasswordEmail };
