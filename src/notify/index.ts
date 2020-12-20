import { Config } from '../config';
import { sendMail } from '../shared/mail';

export async function notify(config: Config, text: string): Promise<void> {
  if (!config.mail) {
    console.error('No mail configuration provided, abort.');
    process.exit(1);
  }

  await sendMail(config.mail, text);
}
