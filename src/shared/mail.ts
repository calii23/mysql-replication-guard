import { createTransport } from 'nodemailer';
import { MailConfig } from '../config/types';

export async function sendMail(mailConfig: MailConfig, text: string): Promise<void> {
  const transport = createTransport(mailConfig.smtp);
  await transport.sendMail({
    from: mailConfig.from,
    to: mailConfig.to,
    cc: mailConfig.cc,
    bcc: mailConfig.bcc,
    replyTo: mailConfig.replyTo,
    inReplyTo: mailConfig.inReplyTo,
    references: mailConfig.references,
    subject: mailConfig.subject,
    text,
  });
  transport.close();
}
