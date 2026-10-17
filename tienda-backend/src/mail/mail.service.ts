import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

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

    const resendApiKey =
      this.configService.get<string>('RESEND_API_KEY') ||
      (smtpPass?.startsWith('re_') ? smtpPass : null);

    if (resendApiKey) {
      this.logger.log('Resend REST API key detected. Email delivery will use HTTPS (port 443) to prevent cloud SMTP port blocking.');
    }

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      const isSecure = smtpPort === 465;
      this.logger.log(`Initializing SMTP fallback transporter: host=${smtpHost}, port=${smtpPort}, secure=${isSecure}`);
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('SMTP fallback mail transporter initialized successfully.');
    } else if (!resendApiKey) {
      this.logger.warn(
        `SMTP environment variables are not fully configured. MailService will run in DEV_LOG mode.`,
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activa tu Cuenta | TapTrade TCG Marketplace</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #07090E;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #0E121B;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-top: 4px solid #E10E0E;
          }
          .header {
            background-color: #07090E;
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }
          .brand-title {
            color: #ffffff;
            margin: 0;
            font-size: 26px;
            font-weight: 900;
            letter-spacing: -0.5px;
          }
          .brand-title span {
            color: #E10E0E;
          }
          .badge {
            display: inline-block;
            font-size: 10px;
            font-family: monospace;
            color: #ff6b6b;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 4px;
          }
          .content {
            padding: 36px 32px;
            line-height: 1.6;
          }
          .content h1 {
            color: #ffffff;
            font-size: 22px;
            margin-top: 0;
            margin-bottom: 16px;
            font-weight: 800;
          }
          .content p {
            font-size: 15px;
            color: #94a3b8;
            margin-bottom: 20px;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn {
            background: linear-gradient(135deg, #800D0D 0%, #E10E0E 50%, #FF5A1F 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 36px;
            font-size: 15px;
            font-weight: bold;
            border-radius: 10px;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(225, 14, 14, 0.35);
          }
          .info-box {
            background-color: rgba(255, 255, 255, 0.03);
            border-left: 3px solid #E10E0E;
            padding: 14px 18px;
            border-radius: 6px;
            margin: 24px 0;
            font-size: 13px;
            color: #cbd5e1;
          }
          .url-box {
            font-size: 12px;
            word-break: break-all;
            color: #93c5fd;
            background-color: rgba(14, 18, 27, 0.8);
            padding: 12px;
            border-radius: 8px;
            border: 1px dashed rgba(255, 255, 255, 0.15);
          }
          .footer {
            background-color: #07090E;
            padding: 22px 30px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 class="brand-title">Tap<span>Trade</span></h2>
            <div class="badge">TCG Marketplace • Activación de Cuenta</div>
          </div>
          <div class="content">
            <h1>¡Bienvenido a TapTrade, ${name || 'Coleccionista'}!</h1>
            <p>Gracias por unirte al marketplace de cartas coleccionables y preventas más grande de Chile. Ya sea que busques singles o sellados de <strong>Pokémon, Magic: The Gathering, Yu-Gi-Oh!, Mitos y Leyendas u One Piece</strong>, tu bóveda está lista.</p>
            <p>Para activar tu cuenta y comenzar a explorar el catálogo con total seguridad, haz clic en el siguiente botón:</p>
            
            <div class="btn-container">
              <a href="${verifyLink}" class="btn" target="_blank">Activar Mi Cuenta</a>
            </div>

            <div class="info-box">
              <strong>🔒 Seguridad y Privacidad:</strong> TapTrade cumple con la Ley N° 19.628 de Protección de Datos Personales. Tus datos e inventario están protegidos bajo estándares de seguridad de grado bancario.
            </div>
            
            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Si el botón no funciona en tu cliente de correo, copia y pega el siguiente enlace en tu navegador:</p>
            <p class="url-box">
              ${verifyLink}
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0;">© ${new Date().getFullYear()} TapTrade SpA. Santiago, Chile. Todos los derechos reservados.</p>
            <p style="margin: 0; font-size: 11px;">Si no te registraste en TapTrade, puedes ignorar este correo de forma segura.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('\n' + '='.repeat(80));
    console.log(`[MAIL_DEV_LOG] ENVIANDO CORREO DE VERIFICACIÓN TAPTRADE A: ${email}`);
    console.log(`[MAIL_DEV_LOG] NOMBRE: ${name}`);
    console.log(`[MAIL_DEV_LOG] ENLACE DE ACTIVACIÓN: ${verifyLink}`);
    console.log('='.repeat(80) + '\n');

    await this.dispatchEmail({
      to: email,
      subject: '¡Activa tu Cuenta en TapTrade TCG Marketplace! 🔥',
      text: `Hola ${name || 'Coleccionista'},\n\n¡Bienvenido a TapTrade! Para verificar tu cuenta y comenzar a explorar el catálogo de cartas coleccionables, por favor visita el siguiente enlace:\n\n${verifyLink}\n\n¡Gracias!`,
      html: htmlContent,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/restablecer-contrasena?token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recuperar Contraseña | TapTrade TCG Marketplace</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #07090E;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #0E121B;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid #E10E0E;
          }
          .header {
            background-color: #07090E;
            padding: 28px 30px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }
          .brand-title {
            color: #ffffff;
            margin: 0;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-weight: 900;
            font-size: 24px;
            letter-spacing: -0.5px;
          }
          .brand-title span {
            color: #E10E0E;
          }
          .badge {
            display: inline-block;
            font-size: 11px;
            font-family: monospace;
            color: #ff6b6b;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 4px;
          }
          .content {
            padding: 36px 32px;
            line-height: 1.6;
          }
          .content h1 {
            color: #ffffff;
            font-size: 22px;
            margin-top: 0;
            font-weight: 700;
          }
          .content p {
            font-size: 15px;
            color: #94a3b8;
            margin-bottom: 20px;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn {
            background: linear-gradient(135deg, #800D0D 0%, #E10E0E 50%, #FF5A1F 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 34px;
            font-size: 15px;
            font-weight: bold;
            border-radius: 10px;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(225, 14, 14, 0.35);
          }
          .warning-box {
            background-color: rgba(225, 14, 14, 0.08);
            border-left: 3px solid #E10E0E;
            padding: 14px 18px;
            border-radius: 6px;
            margin: 24px 0;
            font-size: 13px;
            color: #cbd5e1;
          }
          .url-box {
            font-size: 12px;
            word-break: break-all;
            color: #93c5fd;
            background-color: rgba(14, 18, 27, 0.8);
            padding: 12px;
            border-radius: 8px;
            border: 1px dashed rgba(255, 255, 255, 0.15);
          }
          .footer {
            background-color: #07090E;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 class="brand-title">Tap<span>Trade</span></h2>
            <div class="badge">TCG Marketplace • Seguridad</div>
          </div>
          <div class="content">
            <h1>Hola, ${name || 'Coleccionista'}</h1>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>TapTrade</strong>.</p>
            <p>Para crear una nueva clave de acceso y reingresar a tu bóveda, haz clic en el siguiente botón:</p>
            
            <div class="btn-container">
              <a href="${resetLink}" class="btn" target="_blank">Restablecer Mi Contraseña</a>
            </div>

            <div class="warning-box">
              <strong>Importante:</strong> Este enlace de recuperación es de un solo uso y caduca automáticamente en <strong>60 minutos</strong>. Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual permanecerá intacta.
            </div>
            
            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Si el botón no funciona, copia y pega este enlace directo en tu navegador web:</p>
            <p class="url-box">
              ${resetLink}
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TapTrade TCG Marketplace. Todos los derechos reservados.</p>
            <p>Este correo ha sido enviado automáticamente. Por favor no respondas a esta dirección.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('\n' + '='.repeat(80));
    console.log(`[MAIL_DEV_LOG] ENLACE DE RECUPERACIÓN DE CONTRASEÑA`);
    console.log(`[MAIL_DEV_LOG] DESTINATARIO: ${email}`);
    console.log(`[MAIL_DEV_LOG] NOMBRE: ${name}`);
    console.log(`[MAIL_DEV_LOG] ENLACE DE RECUPERACIÓN: ${resetLink}`);
    console.log('='.repeat(80) + '\n');

    await this.dispatchEmail({
      to: email,
      subject: 'Restablece tu Contraseña | TapTrade TCG Marketplace',
      text: `Hola ${name || 'Coleccionista'},\n\nPara restablecer tu contraseña en TapTrade, por favor visita el siguiente enlace:\n\n${resetLink}\n\nEste enlace caduca en 60 minutos.\n\nSi no fuiste tú, puedes ignorar este correo.`,
      html: htmlContent,
    });
  }

  private async dispatchEmail(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    const rawFrom = this.configService.get<string>('SMTP_FROM') || 'TapTrade <no-reply@taptrade.cl>';
    const mailFrom = rawFrom.trim().replace(/^"|"$/g, '');

    const resendApiKey =
      this.configService.get<string>('RESEND_API_KEY') ||
      (this.configService.get<string>('SMTP_PASS')?.startsWith('re_')
        ? this.configService.get<string>('SMTP_PASS')
        : null);

    // 1. Resend REST API (HTTPS puerto 443).
    // Fundamental para Render / Cloud donde los puertos SMTP (465/587) están bloqueados por firewall.
    if (resendApiKey) {
      try {
        this.logger.log(`[Resend HTTP] Sending email to ${options.to} via HTTPS port 443...`);
        const response = await axios.post(
          'https://api.resend.com/emails',
          {
            from: mailFrom,
            to: [options.to],
            subject: options.subject,
            text: options.text,
            html: options.html,
          },
          {
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 8000,
          },
        );
        this.logger.log(`[Resend HTTP] Email sent successfully to ${options.to} (id: ${response.data?.id})`);
        return;
      } catch (err: any) {
        this.logger.error(
          `[Resend HTTP] Failed to send email to ${options.to}: ${err.response?.data?.message || err.message}`,
        );
      }
    }

    // 2. Fallback SMTP (Nodemailer)
    if (this.transporter) {
      try {
        this.logger.log(`[SMTP Fallback] Attempting to send email to ${options.to}...`);
        const info = await this.transporter.sendMail({
          from: mailFrom,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        this.logger.log(`[SMTP Fallback] Email sent successfully to: ${options.to} (messageId: ${info.messageId})`);
      } catch (error: any) {
        this.logger.error(`[SMTP Fallback] Failed to send email to ${options.to}: ${error.message}`);
        if (error.stack) {
          this.logger.error(error.stack);
        }
      }
    } else if (!resendApiKey) {
      this.logger.warn(`No email provider configured. Email to ${options.to} was only logged to console.`);
    }
  }
}

