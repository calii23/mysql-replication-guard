import { MailConfig } from '../config/types';
import { sendMail } from './mail';

let mailConfig: MailConfig;
let shouldSendMail = false;
const logs: string[] = [];

export function initMailLogging(config: MailConfig) {
  mailConfig = config;
}

export function log(...args: string[]): void {
  console.log(...args);
  logs.push(`LOG: ${args.join(' ')}`);
}

export function error(...args: string[]): void {
  console.error(...args);
  logs.push(`ERROR: ${args.join(' ')}`);
  sendLogsByMail();
}

export function thrownError(where: string, error: Error): void {
  console.error(where, error.message);
  logs.push(`THROWN ERROR: ${where}: ${error}`);
  sendLogsByMail();
}

export function sendLogsByMail(): void {
  if (shouldSendMail || !mailConfig) return;
  shouldSendMail = true;
  process.once('beforeExit', () => sendMail(mailConfig, logs.join('\n')));
}

