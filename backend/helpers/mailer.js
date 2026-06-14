const { transporter } = require('../lib/nodemailer');

const { clientURL, smtpFrom } = require('../config/env');

const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${clientURL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: 'Ubah Kata Sandi - LAPAK',
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <!-- Header -->
        <tr>
          <td style="background-color: #0d5740; padding: 24px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h2 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 1px;">LAPAK</h2>
            <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Business Management</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding: 32px 24px;">
            <h3 style="color: #1a1a2e; margin-top: 0; font-size: 18px;">Ubah Kata Sandi</h3>
            <p style="color: #666; line-height: 1.6; font-size: 14px;">Kami menerima permintaan untuk perubahan kata sandi akun Anda. Klik tombol di bawah untuk melanjutkan:</p>
            <!-- Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
              <tr>
                <td align="center">
                  <a href="${resetLink}" style="background-color: #0d5740; color: #ffffff; padding: 13px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 14px;">Ubah Kata Sandi</a>
                </td>
              </tr>
            </table>
            <!-- Link fallback -->
            <p style="color: #999; font-size: 12px; line-height: 1.5;">
              Atau salin link berikut: <br>
              <span style="color: #0d5740; word-break: break-all;">${resetLink}</span>
            </p>
            <!-- Divider -->
            <hr style="border: none; border-top: 1px solid #f0f0f5; margin: 24px 0;">
            <p style="color: #aaa; font-size: 12px; line-height: 1.5;">Link ini berlaku selama 1 jam. Jika Anda tidak meminta perubahan kata sandi, abaikan email ini.</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color: #f5f6fa; padding: 16px; text-align: center; border-radius: 0 0 12px 12px;">
            <p style="color: #aaa; font-size: 11px; margin: 0;">&copy; 2026 LAPAK. All rights reserved.</p>
          </td>
        </tr>
      </table>
    `,
  });
};

module.exports = { sendResetPasswordEmail };
