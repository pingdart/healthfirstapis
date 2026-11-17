import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'arunbhairi669@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'lwpxpvavrzznioxm';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'arunbhairi669@gmail.com';
const SENDER_NAME = process.env.SENDER_NAME || 'HealthFirst Clinics';
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'arunbhairi669@gmail.com';

const CLINIC_NAME = 'HealthFirst Clinics';
const CLINIC_PHONE = '+91 92818 62664';
const CLINIC_LOCATION = 'Opposite Metro Pillar 1526, Kothapet, Hyderabad';
const CLINIC_WEBSITE = 'https://healthfirstclinics.com';

// Reusable Transporter
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // TLS on 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function wrapHtmlTemplate(title: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #003B5C 0%, #00A7B5 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 32px 28px; }
    .card { background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
    .card-row:last-child { border-bottom: none; }
    .card-label { color: #64748b; font-weight: 600; }
    .card-value { color: #0f172a; font-weight: 700; text-align: right; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .badge-pending { background-color: #fef3c7; color: #92400e; }
    .badge-approved { background-color: #d1fae5; color: #065f46; }
    .btn { display: inline-block; background-color: #00A7B5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 14px; margin-top: 10px; }
    .footer { background-color: #00273d; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${CLINIC_NAME}</h1>
      <p>Compassionate Care • Verified Medical Specialists</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>${CLINIC_NAME}</strong></p>
      <p style="margin: 0 0 6px 0;">${CLINIC_LOCATION}</p>
      <p style="margin: 0 0 10px 0;">Helpline: <a href="tel:${CLINIC_PHONE.replace(/\s+/g, '')}">${CLINIC_PHONE}</a></p>
      <p style="margin: 0; font-size: 11px; opacity: 0.8;">© ${new Date().getFullYear()} ${CLINIC_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * 1. Send Appointment Booked Email
 * - Sent to Patient (if email provided)
 * - Sent to Clinic Admin
 */
export async function sendAppointmentBookedEmail({
  appointment,
  doctorName,
  doctorSpecialization,
}: {
  appointment: any;
  doctorName: string;
  doctorSpecialization?: string;
}) {
  const aptId = `APT-${String(appointment.id).padStart(4, '0')}`;

  // A. Email to Patient
  if (appointment.email && appointment.email.trim()) {
    const patientHtml = wrapHtmlTemplate(
      'Appointment Booking Confirmation',
      `
      <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Dear ${appointment.patientName},</h2>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Thank you for choosing <strong>${CLINIC_NAME}</strong>. We have received your appointment request.
      </p>

      <div class="card">
        <div class="card-row">
          <span class="card-label">Appointment ID:</span>
          <span class="card-value">${aptId}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Doctor:</span>
          <span class="card-value">${doctorName}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Department:</span>
          <span class="card-value">${doctorSpecialization || appointment.department}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Date:</span>
          <span class="card-value">${appointment.date}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Time Slot:</span>
          <span class="card-value">${appointment.timeSlot}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Payment Mode:</span>
          <span class="card-value">${appointment.paymentType || 'Pay at Clinic'}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Status:</span>
          <span class="card-value"><span class="badge badge-pending">Pending Confirmation</span></span>
        </div>
      </div>

      <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
        Our clinic staff will review your booking and send you a confirmation approval shortly. If you need any immediate assistance or need to reschedule, please call our 24/7 helpline at <strong>${CLINIC_PHONE}</strong>.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${CLINIC_WEBSITE}" class="btn">Visit Website</a>
      </div>
      `
    );

    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to: appointment.email,
      subject: `Appointment Booking Received: ${aptId} - ${CLINIC_NAME}`,
      html: patientHtml,
    }).catch(err => console.error("Error sending patient booking email:", err));
  }

  // B. Alert to Admin
  const adminHtml = wrapHtmlTemplate(
    'New Appointment Alert',
    `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">🚨 New Appointment Booking Received</h2>
    <p style="font-size: 15px; color: #475569; line-height: 1.6;">
      A patient has just booked an appointment online. Please review and approve it in the admin panel.
    </p>

    <div class="card">
      <div class="card-row">
        <span class="card-label">Appointment ID:</span>
        <span class="card-value">${aptId}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Patient Name:</span>
        <span class="card-value">${appointment.patientName}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Phone:</span>
        <span class="card-value"><a href="tel:${appointment.phone}" style="color: #00A7B5;">${appointment.phone}</a></span>
      </div>
      <div class="card-row">
        <span class="card-label">Email:</span>
        <span class="card-value">${appointment.email || 'N/A'}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Doctor:</span>
        <span class="card-value">${doctorName}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Date & Time:</span>
        <span class="card-value">${appointment.date} at ${appointment.timeSlot}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Payment:</span>
        <span class="card-value">${appointment.paymentType || 'Cash'} (${appointment.paymentStatus || 'Unpaid'})</span>
      </div>
    </div>
    `
  );

  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to: ADMIN_ALERT_EMAIL,
    subject: `[New Appointment] #${appointment.id} ${appointment.patientName} - ${doctorName}`,
    html: adminHtml,
  }).catch(err => console.error("Error sending admin booking alert:", err));
}

/**
 * 2. Send Appointment Approved Email
 * - Sent to Patient when admin sets status to 'Approved' or 'Confirmed'
 */
export async function sendAppointmentApprovedEmail({
  appointment,
  doctorName,
  doctorSpecialization,
}: {
  appointment: any;
  doctorName: string;
  doctorSpecialization?: string;
}) {
  if (!appointment.email || !appointment.email.trim()) return;

  const aptId = `APT-${String(appointment.id).padStart(4, '0')}`;

  const approvedHtml = wrapHtmlTemplate(
    'Appointment Approved & Confirmed',
    `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 48px;">✅</span>
      <h2 style="color: #065f46; margin: 10px 0 0 0; font-size: 22px;">Appointment Confirmed!</h2>
      <p style="font-size: 14px; color: #64748b; margin-top: 4px;">Your consultation has been officially scheduled.</p>
    </div>

    <p style="font-size: 15px; color: #334155; line-height: 1.6;">
      Dear <strong>${appointment.patientName}</strong>,
    </p>
    <p style="font-size: 15px; color: #475569; line-height: 1.6;">
      We are pleased to inform you that your appointment with <strong>${doctorName}</strong> at <strong>${CLINIC_NAME}</strong> has been approved.
    </p>

    <div class="card" style="border-left: 4px solid #10b981;">
      <div class="card-row">
        <span class="card-label">Appointment ID:</span>
        <span class="card-value">${aptId}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Doctor:</span>
        <span class="card-value">${doctorName}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Department:</span>
        <span class="card-value">${doctorSpecialization || appointment.department}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Date:</span>
        <span class="card-value" style="color: #00A7B5;">${appointment.date}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Time Slot:</span>
        <span class="card-value" style="color: #00A7B5;">${appointment.timeSlot}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Location:</span>
        <span class="card-value">${CLINIC_LOCATION}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Status:</span>
        <span class="card-value"><span class="badge badge-approved">Confirmed / Approved</span></span>
      </div>
    </div>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-top: 16px;">
      <p style="margin: 0; font-size: 13px; color: #166534;">
        💡 <strong>Patient Tip:</strong> Please arrive 10-15 minutes prior to your time slot for verification and vitals recording. Carry any previous medical reports or prescription history.
      </p>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
      Need to reschedule or have questions? Contact us anytime at <strong>${CLINIC_PHONE}</strong>.
    </p>
    `
  );

  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to: appointment.email,
    subject: `✅ Appointment Confirmed: ${aptId} with ${doctorName}`,
    html: approvedHtml,
  }).catch(err => console.error("Error sending appointment approved email:", err));
}

/**
 * 3. Send Inquiry Received Email
 * - Sent to User (acknowledgement)
 * - Sent to Admin (alert)
 */
export async function sendInquiryReceivedEmail({
  inquiry,
}: {
  inquiry: any;
}) {
  // A. Acknowledgement to User
  if (inquiry.email && inquiry.email.trim()) {
    const userHtml = wrapHtmlTemplate(
      'Thank you for contacting HealthFirst Clinics',
      `
      <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Dear ${inquiry.name},</h2>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Thank you for getting in touch with <strong>${CLINIC_NAME}</strong>. We have safely received your inquiry.
      </p>

      <div class="card">
        <div class="card-row">
          <span class="card-label">Your Name:</span>
          <span class="card-value">${inquiry.name}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Phone:</span>
          <span class="card-value">${inquiry.phone || 'N/A'}</span>
        </div>
        <div style="padding-top: 12px; margin-top: 12px; border-top: 1px dashed #e2e8f0;">
          <span class="card-label" style="display: block; margin-bottom: 6px;">Your Message:</span>
          <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5; font-style: italic; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
            ${inquiry.message}
          </p>
        </div>
      </div>

      <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
        A member of our clinic team will review your query and reply back to your email or call you shortly. For urgent inquiries, please contact our clinic directly at <strong>${CLINIC_PHONE}</strong>.
      </p>
      `
    );

    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to: inquiry.email,
      subject: `We Received Your Inquiry - ${CLINIC_NAME}`,
      html: userHtml,
    }).catch(err => console.error("Error sending user inquiry acknowledgement email:", err));
  }

  // B. Alert to Admin
  const adminHtml = wrapHtmlTemplate(
    'New Contact Inquiry',
    `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">📩 New Contact Inquiry Received</h2>
    <p style="font-size: 15px; color: #475569; line-height: 1.6;">
      A new inquiry has been submitted through the clinic contact form.
    </p>

    <div class="card">
      <div class="card-row">
        <span class="card-label">Inquiry ID:</span>
        <span class="card-value">#INQ-${inquiry.id}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Sender Name:</span>
        <span class="card-value">${inquiry.name}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Email:</span>
        <span class="card-value"><a href="mailto:${inquiry.email}" style="color: #00A7B5;">${inquiry.email}</a></span>
      </div>
      <div class="card-row">
        <span class="card-label">Phone:</span>
        <span class="card-value"><a href="tel:${inquiry.phone || ''}" style="color: #00A7B5;">${inquiry.phone || 'N/A'}</a></span>
      </div>
      <div style="padding-top: 12px; margin-top: 12px; border-top: 1px dashed #e2e8f0;">
        <span class="card-label" style="display: block; margin-bottom: 6px;">Message Content:</span>
        <p style="margin: 0; font-size: 14px; color: #0f172a; line-height: 1.5; background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; white-space: pre-wrap;">
${inquiry.message}
        </p>
      </div>
    </div>
    `
  );

  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to: ADMIN_ALERT_EMAIL,
    subject: `[New Inquiry] #${inquiry.id} from ${inquiry.name}`,
    html: adminHtml,
  }).catch(err => console.error("Error sending admin inquiry alert email:", err));
}

/**
 * 4. Send Inquiry Reply Email
 * - Sent to User with the Admin's response
 */
export async function sendInquiryReplyEmail({
  inquiry,
  replyMessage,
}: {
  inquiry: any;
  replyMessage: string;
}) {
  if (!inquiry.email || !inquiry.email.trim()) {
    throw new Error('Inquiry does not have a valid email address');
  }

  const replyHtml = wrapHtmlTemplate(
    'Response to your Inquiry',
    `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Dear ${inquiry.name},</h2>
    <p style="font-size: 15px; color: #475569; line-height: 1.6;">
      Thank you for contacting <strong>${CLINIC_NAME}</strong>. In response to your inquiry, our team has provided the following reply:
    </p>

    <div style="background-color: #f0fdfa; border-left: 4px solid #00A7B5; border-radius: 8px; padding: 18px; margin: 20px 0; border: 1px solid #ccfbf1;">
      <p style="margin: 0; font-size: 15px; color: #0f172a; line-height: 1.7; white-space: pre-wrap; font-weight: 500;">
${replyMessage}
      </p>
    </div>

    <div class="card">
      <span class="card-label" style="display: block; font-size: 12px; margin-bottom: 6px; text-transform: uppercase;">Reference - Your Original Message:</span>
      <p style="margin: 0; font-size: 13px; color: #64748b; font-style: italic; line-height: 1.5;">
        &ldquo;${inquiry.message}&rdquo;
      </p>
    </div>

    <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
      If you have further questions or would like to book a consultation, feel free to reply directly to this email or contact us at <strong>${CLINIC_PHONE}</strong>.
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${CLINIC_WEBSITE}/book-appointment" class="btn">Book an Appointment</a>
    </div>
    `
  );

  return transporter.sendMail({
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to: inquiry.email,
    subject: `Re: Your Inquiry with ${CLINIC_NAME}`,
    html: replyHtml,
  });
}

