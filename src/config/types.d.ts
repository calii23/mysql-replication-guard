import { ConnectionConfig } from 'mysql';
import { Options as SMTPOptions } from 'nodemailer/lib/smtp-connection';
import { Address } from 'nodemailer/lib/mailer';

export interface StrictConnectionConfig extends ConnectionConfig {
  host: string;
  user: string;
  /**
   * The database must not be specified here
   */
  database: never;
}

export interface SlaveMasterConnection {
  host: string;
  /**
   * @type integer
   * @minimum 0
   * @maximum 65535
   */
  port?: number;
  user: string;
  /**
   * @minLength 8
   * @maxLength 32
   */
  password?: string;
}

export interface StrictSTMPOptions extends SMTPOptions {
  /** the hostname or IP address to connect to (defaults to ‘localhost’) */
  host: string;

  socket?: never;
}

export interface MailConfig {
  /**
   * SMTP connection data
   */
  smtp: StrictSTMPOptions;

  /**
   * The e-mail address of the sender. All e-mail addresses can be plain 'sender@server.com' or formatted 'Sender Name <sender@server.com>'
   */
  from: string | Address;

  /**
   * Comma separated list or an array of recipients e-mail addresses that will appear on the To: field
   */
  to: string | Address | Array<string | Address>;

  /**
   * Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field
   */
  cc?: string | Address | Array<string | Address>;

  /**
   * Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field
   */
  bcc?: string | Address | Array<string | Address>;

  /**
   * An e-mail address that will appear on the Reply-To: field
   */
  replyTo?: string | Address;

  /**
   * The message-id this message is replying
   */
  inReplyTo?: string | Address;

  /**
   * Message-id list (an array or space separated string)
   */
  references?: string | string[];

  /**
   * The subject of the e-mail
   */
  subject?: string;
}

export interface Config {
  /**
   * The database connection to the master from the Node.js process
   */
  master: StrictConnectionConfig;

  /**
   * The database connection to the slave from the Node.js process
   */
  slave: StrictConnectionConfig;

  /**
   * The connection from the slave to the master.
   */
  slaveMasterConnection: SlaveMasterConnection;

  /**
   * The name of the database (master and slave name must match)
   */
  databaseName: string;

  /**
   * The tables which need to be synced with the slave (or 'all' for all table in the master database)
   */
  tables: string[] | 'all';

  /**
   * The name of the replication channel. See in the
   * [MySQL Documentation](https://dev.mysql.com/doc/refman/5.7/en/replication-multi-source.html)
   * for detailed information.
   */
  replicationChannel: string;

  /**
   * The path to the `mysql` tool.
   */
  mysqlTool: string;

  /**
   * The path to the `mysqldump` tool.
   */
  dumpTool: string;

  mail?: MailConfig;
}
