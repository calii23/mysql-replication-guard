import { ConnectionConfig } from 'mysql';

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
}
