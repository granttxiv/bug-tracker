// Email Service (Phase 5)
// Currently logs to console. In production, use SendGrid/SES

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  // TODO: Integrate with SendGrid/SES
  console.log(`[EMAIL] To: ${options.to}`);
  console.log(`[EMAIL] Subject: ${options.subject}`);
  console.log(`[EMAIL] Body: ${options.html.substring(0, 100)}...`);
  return true;
}

export function getTicketCreatedEmail(clientName: string, ticketTitle: string, ticketId: string) {
  return {
    subject: `Ticket Created: ${ticketTitle}`,
    html: `
      <h2>Ticket Received</h2>
      <p>Hi ${clientName},</p>
      <p>We've received your ticket: <strong>${ticketTitle}</strong></p>
      <p>Ticket ID: ${ticketId}</p>
      <p>We'll get back to you soon!</p>
    `,
  };
}

export function getTicketAssignedEmail(agentName: string, ticketTitle: string, ticketId: string) {
  return {
    subject: `Ticket Assigned: ${ticketTitle}`,
    html: `
      <h2>Ticket Assigned</h2>
      <p>Hi ${agentName},</p>
      <p>A ticket has been assigned to you: <strong>${ticketTitle}</strong></p>
      <p>Ticket ID: ${ticketId}</p>
      <p>Please review and respond at your earliest convenience.</p>
    `,
  };
}

export function getCommentAddedEmail(
  userName: string,
  ticketTitle: string,
  comment: string,
  ticketId: string,
) {
  return {
    subject: `New Comment: ${ticketTitle}`,
    html: `
      <h2>New Comment</h2>
      <p>Hi ${userName},</p>
      <p><strong>${comment.substring(0, 50)}...</strong></p>
      <p>Ticket: ${ticketTitle}</p>
      <p>Ticket ID: ${ticketId}</p>
    `,
  };
}

export function getSLABreachEmail(
  agentName: string,
  ticketTitle: string,
  breachType: string,
  ticketId: string,
) {
  return {
    subject: `SLA Breach Alert: ${ticketTitle}`,
    html: `
      <h2>SLA Breach</h2>
      <p>Hi ${agentName},</p>
      <p>An SLA breach has occurred: <strong>${breachType}</strong></p>
      <p>Ticket: ${ticketTitle}</p>
      <p>Ticket ID: ${ticketId}</p>
      <p>Please take immediate action.</p>
    `,
  };
}
