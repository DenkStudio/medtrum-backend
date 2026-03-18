import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

interface ReimbursementEmailParams {
  patientEmail: string;
  patientName: string;
  supplyName: string;
  quantity: number;
  trackingLink?: string;
  shippingDate?: string;
}

interface InvitationEmailParams {
  email: string;
  name?: string;
  actionLink: string;
}

interface WelcomeEmailParams {
  email: string;
  name?: string;
}

interface SupplyDeliveryEmailParams {
  patientEmail: string;
  patientName?: string;
  supplyName: string;
  quantity: number;
  date: string;
  observations?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn("RESEND_API_KEY not set — emails will be disabled");
    }
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@medtrum.com";
  }

  private wrapHtml(heroLabel: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Medtrum</title>
  <style>
    body { margin: 0; padding: 40px 16px; background-color: #EAF2EE; font-family: 'Trebuchet MS', Arial, sans-serif; }
    * { box-sizing: border-box; }
    a { text-decoration: none; }
  </style>
</head>
<body>
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 4px; overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0D4A3A 0%, #1A6B52 100%); padding: 36px 48px; text-align: center; position: relative;">
      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="width: 40px; height: 40px; border-radius: 8px; background: rgba(255,255,255,0.15); text-align: center; vertical-align: middle; font-size: 20px; color: white;">&#9678;</td>
          <td style="padding-left: 10px; color: white; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; vertical-align: middle;">Medtrum</td>
        </tr>
      </table>
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #4ECFA0, #A8F0D4, #4ECFA0);"></div>
    </div>
    <!-- Hero band -->
    <div style="background: #F4FAF7; border-bottom: 1px solid #D6EDE4; padding: 20px 48px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 8px; height: 8px; border-radius: 50%; background: #1A6B52;"></td>
          <td style="padding-left: 12px; font-size: 12px; color: #1A6B52; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">${heroLabel}</td>
        </tr>
      </table>
    </div>
    <!-- Body -->
    <div style="padding: 40px 48px;">
      ${body}
    </div>
    <!-- Footer -->
    <div style="background: #0D2B22; padding: 24px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size: 12px; color: rgba(255,255,255,0.4);">&copy; ${new Date().getFullYear()} Medtrum S.A.</td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>`;
  }

  async sendInvitationEmail(params: InvitationEmailParams) {
    const { email, name, actionLink } = params;

    const html = this.wrapHtml("Invitación a la plataforma", `
      <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #0D2B22; line-height: 1.3;">
        ¡Hola${name ? `, ${name}` : ""}!
      </h1>
      <p style="margin: 0 0 28px; font-size: 15px; color: #4A6B5E; line-height: 1.8;">
        Fuiste invitado/a a acceder a la plataforma de gestión de <strong style="color: #0D4A3A;">Medtrum</strong>. Para comenzar, configurá tu contraseña y accedé a tu panel de control.
      </p>

      <!-- Info card -->
      <div style="background: #F4FAF7; border-radius: 10px; border: 1px solid #C8E6D8; padding: 20px 24px; margin-bottom: 32px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: top; padding-right: 14px; font-size: 16px; color: #1A6B52; font-weight: 700;">&#9432;</td>
            <td style="font-size: 13px; color: #2D6050; line-height: 1.6;">
              Este enlace es de uso único y expira en <strong>48 horas</strong>. Si no lo usás antes de esa fecha, deberás solicitar una nueva invitación.
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-bottom: 36px;">
        <a href="${actionLink}" style="display: inline-block; background: #0D4A3A; color: white; padding: 16px 48px; border-radius: 8px; font-size: 15px; font-weight: 700; letter-spacing: 0.3px; font-family: 'Trebuchet MS', Arial, sans-serif;">
          Configurar mi contraseña
        </a>
      </div>

      <div style="border-top: 1px solid #E8F0ED; margin-bottom: 24px;"></div>

      <p style="font-size: 13px; color: #90A89E; line-height: 1.7; margin: 0;">
        Si no solicitaste esta invitación, podés ignorar este mensaje. Tu cuenta permanecerá inactiva hasta que se complete la configuración.
      </p>
    `);

    if (!this.resend) {
      this.logger.warn(`Email skipped (no API key): invitation to ${email}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: "Has sido invitado/a a Medtrum",
        html,
      });
      this.logger.log(`Invitation email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send invitation email to ${email}: ${error?.message}`);
    }
  }

  async sendWelcomeEmail(params: WelcomeEmailParams) {
    const { email, name } = params;

    const html = this.wrapHtml("Bienvenida", `
      <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #0D2B22; line-height: 1.3;">
        ¡Bienvenido/a${name ? `, ${name}` : ""}!
      </h1>
      <p style="margin: 0 0 16px; font-size: 15px; color: #4A6B5E; line-height: 1.8;">
        Tu cuenta en <strong style="color: #0D4A3A;">Medtrum</strong> ha sido creada exitosamente.
      </p>
      <p style="margin: 0 0 28px; font-size: 15px; color: #4A6B5E; line-height: 1.8;">
        Desde la plataforma vas a poder gestionar tus insumos, realizar reclamos y hacer seguimiento de tus entregas.
      </p>

      <div style="border-top: 1px solid #E8F0ED; margin-bottom: 24px;"></div>

      <p style="font-size: 13px; color: #90A89E; line-height: 1.7; margin: 0;">
        Si tenés alguna consulta, no dudes en contactarnos.
      </p>
    `);

    if (!this.resend) {
      this.logger.warn(`Email skipped (no API key): welcome to ${email}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: "Bienvenido/a a Medtrum",
        html,
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send welcome email to ${email}: ${error?.message}`);
    }
  }

  async sendSupplyDeliveryNotification(params: SupplyDeliveryEmailParams) {
    const { patientEmail, patientName, supplyName, quantity, date, observations } = params;

    const formattedDate = new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const observationsRow = observations
      ? `<tr>
          <td style="padding: 8px 12px; color: #4A6B5E; font-size: 14px; border-bottom: 1px solid #E8F0ED;">Observaciones</td>
          <td style="padding: 8px 12px; font-size: 14px; color: #0D2B22; border-bottom: 1px solid #E8F0ED;">${observations}</td>
        </tr>`
      : "";

    const html = this.wrapHtml("Entrega de insumos", `
      <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #0D2B22; line-height: 1.3;">
        ¡Hola${patientName ? `, ${patientName}` : ""}!
      </h1>
      <p style="margin: 0 0 28px; font-size: 15px; color: #4A6B5E; line-height: 1.8;">
        Te informamos que se te ha asignado una entrega de insumos.
      </p>

      <!-- Detail card -->
      <div style="background: #F4FAF7; border-radius: 10px; border: 1px solid #C8E6D8; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #0D4A3A;">Detalle de la entrega</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px; color: #4A6B5E; font-size: 14px; border-bottom: 1px solid #E8F0ED;">Insumo</td>
            <td style="padding: 8px 12px; font-size: 14px; color: #0D2B22; font-weight: 600; border-bottom: 1px solid #E8F0ED;">${supplyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #4A6B5E; font-size: 14px; border-bottom: 1px solid #E8F0ED;">Cantidad</td>
            <td style="padding: 8px 12px; font-size: 14px; color: #0D2B22; border-bottom: 1px solid #E8F0ED;">${quantity}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #4A6B5E; font-size: 14px; border-bottom: 1px solid #E8F0ED;">Fecha</td>
            <td style="padding: 8px 12px; font-size: 14px; color: #0D2B22; border-bottom: 1px solid #E8F0ED;">${formattedDate}</td>
          </tr>
          ${observationsRow}
        </table>
      </div>

      <div style="border-top: 1px solid #E8F0ED; margin-bottom: 24px;"></div>

      <p style="font-size: 13px; color: #90A89E; line-height: 1.7; margin: 0;">
        Si tenés alguna consulta, no dudes en contactarnos.
      </p>
    `);

    if (!this.resend) {
      this.logger.warn(`Email skipped (no API key): supply delivery to ${patientEmail}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: patientEmail,
        subject: "Nueva entrega de insumos - Medtrum",
        html,
      });
      this.logger.log(`Supply delivery email sent to ${patientEmail}`);
    } catch (error: any) {
      this.logger.error(`Failed to send supply delivery email to ${patientEmail}: ${error?.message}`);
    }
  }

  async sendReimbursementNotification(params: ReimbursementEmailParams) {
    const {
      patientEmail,
      patientName,
      supplyName,
      quantity,
      trackingLink,
      shippingDate,
    } = params;

    const formattedDate = shippingDate
      ? new Date(shippingDate).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null;

    const trackingRow = trackingLink
      ? `<tr>
          <td style="padding: 8px 12px; color: #4A6B5E; font-size: 14px; border-bottom: 1px solid #E8F0ED;">Seguimiento</td>
          <td style="padding: 8px 12px; font-size: 14px; border-bottom: 1px solid #E8F0ED;">
            <a href="${trackingLink}" style="color: #1A6B52; text-decoration: underline;">${trackingLink}</a>
          </td>
        </tr>`
      : "";

    const dateRow = formattedDate
      ? `<tr>
          <td style="padding: 8px 12px; color: #4A6B5E; font-size: 14px; border-bottom: 1px solid #E8F0ED;">Fecha de envío</td>
          <td style="padding: 8px 12px; font-size: 14px; color: #0D2B22; border-bottom: 1px solid #E8F0ED;">${formattedDate}</td>
        </tr>`
      : "";

    const html = this.wrapHtml("Reintegro procesado", `
      <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #0D2B22; line-height: 1.3;">
        ¡Hola${patientName ? `, ${patientName}` : ""}!
      </h1>
      <p style="margin: 0 0 28px; font-size: 15px; color: #4A6B5E; line-height: 1.8;">
        Nos comunicamos para informarte que tu reintegro ha sido procesado y el envío está en camino.
      </p>

      <!-- Detail card -->
      <div style="background: #F4FAF7; border-radius: 10px; border: 1px solid #C8E6D8; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #0D4A3A;">Detalle del envío</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px; color: #4A6B5E; font-size: 14px; border-bottom: 1px solid #E8F0ED;">Insumo</td>
            <td style="padding: 8px 12px; font-size: 14px; color: #0D2B22; font-weight: 600; border-bottom: 1px solid #E8F0ED;">${supplyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #4A6B5E; font-size: 14px; border-bottom: 1px solid #E8F0ED;">Cantidad</td>
            <td style="padding: 8px 12px; font-size: 14px; color: #0D2B22; border-bottom: 1px solid #E8F0ED;">${quantity}</td>
          </tr>
          ${dateRow}
          ${trackingRow}
        </table>
      </div>

      <div style="border-top: 1px solid #E8F0ED; margin-bottom: 24px;"></div>

      <p style="font-size: 13px; color: #90A89E; line-height: 1.7; margin: 0;">
        Si tenés alguna consulta, no dudes en contactarnos.
      </p>
    `);

    if (!this.resend) {
      this.logger.warn(`Email skipped (no API key): reimbursement to ${patientEmail}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: patientEmail,
        subject: "Tu reintegro ha sido enviado - Medtrum",
        html,
      });
      this.logger.log(`Reimbursement email sent to ${patientEmail}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send reimbursement email to ${patientEmail}: ${error?.message}`,
      );
    }
  }
}
