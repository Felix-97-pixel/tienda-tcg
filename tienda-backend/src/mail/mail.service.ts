import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger('MailService');

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPortRaw = this.configService.get<string>('SMTP_PORT');
    const smtpPort = smtpPortRaw ? parseInt(smtpPortRaw, 10) : undefined;
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      const isSecure = smtpPort === 465;
      this.logger.log(`Initializing SMTP transporter: host=${smtpHost}, port=${smtpPort}, secure=${isSecure}, user=${smtpUser}`);
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('SMTP mail transporter initialized successfully.');
    } else {
      this.logger.warn(
        `SMTP environment variables are not fully configured (host=${smtpHost}, port=${smtpPortRaw}, user=${smtpUser}). MailService will run in DEV_LOG mode.`,
      );
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verifica tu Cuenta | Blood Moon Games</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f5;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border-top: 5px solid #800D0D;
          }
          .header {
            background-color: #111111;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          .content h1 {
            color: #800D0D;
            font-size: 24px;
            margin-top: 0;
            font-weight: 800;
          }
          .content p {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 24px;
          }
          .btn-container {
            text-align: center;
            margin: 35px 0;
          }
          .btn {
            background-color: #800D0D;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 6px;
            display: inline-block;
            box-shadow: 0 4px 6px rgba(128, 13, 13, 0.2);
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="color: #ffffff; margin: 0; font-family: sans-serif; letter-spacing: 2px; font-size: 20px; text-transform: uppercase;">Blood Moon Games</h2>
          </div>
          <div class="content">
            <h1>¡Hola, ${name || 'Jugador'}!</h1>
            <p>Gracias por registrarte en el sitio oficial de <strong>Blood Moon Games</strong>. Para poder ingresar a tu cuenta y comenzar a explorar nuestro catálogo de TCG y preventas, necesitamos validar tu correo electrónico.</p>
            <p>Por favor, haz clic en el siguiente botón para activar tu cuenta de inmediato:</p>
            
            <div class="btn-container">
              <a href="${verifyLink}" class="btn" target="_blank">Activar Mi Cuenta</a>
            </div>
            
            <p style="font-size: 14px; color: #9ca3af;">Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
            <p style="font-size: 13px; word-break: break-all; color: #3b82f6; background-color: #eff6ff; padding: 10px; border-radius: 4px; border: 1px dashed #bfdbfe;">
              ${verifyLink}
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Blood Moon Games. Todos los derechos reservados.</p>
            <p>Si no te registraste en nuestro sitio, puedes ignorar este correo de forma segura.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('\n' + '='.repeat(80));
    console.log(`[MAIL_DEV_LOG] ENVIANDO CORREO DE VERIFICACIÓN A: ${email}`);
    console.log(`[MAIL_DEV_LOG] NOMBRE: ${name}`);
    console.log(`[MAIL_DEV_LOG] ENLACE DE ACTIVACIÓN: ${verifyLink}`);
    console.log('='.repeat(80) + '\n');

    if (this.transporter) {
      try {
        const mailFrom = this.configService.get<string>('SMTP_FROM') || '"Blood Moon Games" <no-reply@bloodmoongames.cl>';
        this.logger.log(`Attempting to send email to ${email} from ${mailFrom}...`);
        const info = await this.transporter.sendMail({
          from: mailFrom,
          to: email,
          subject: 'Verifica tu Cuenta | Blood Moon Games',
          text: `Hola ${name || 'Jugador'},\n\nGracias por registrarte en Blood Moon Games. Para verificar tu cuenta, por favor visita el siguiente enlace:\n\n${verifyLink}\n\n¡Gracias!`,
          html: htmlContent,
        });
        this.logger.log(`Verification email sent successfully to: ${email} (messageId: ${info.messageId})`);
      } catch (error: any) {
        this.logger.error(`Failed to send verification email to ${email}: ${error.message}`);
        this.logger.error(`SMTP Error Code: ${error.code || 'N/A'}, Response: ${error.response || 'N/A'}`);
        if (error.stack) {
          this.logger.error(error.stack);
        }
      }
    } else {
      this.logger.warn('No SMTP transporter available. Email was only logged to console.');
    }
  }
}
