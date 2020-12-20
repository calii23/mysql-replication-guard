import {
  Connection,
  ConnectionConfig,
  ConnectionOptions,
  createConnection,
  FieldInfo,
  MysqlError,
  QueryOptions,
} from 'mysql';
import { Config } from '../config';

export interface AsyncMysqlConnectionOperations {
  createQuery<R>(options: string | QueryOptions, values?: any[]): Promise<[results: R[], fields: FieldInfo[]]>;
  query<R>(options: string | QueryOptions, values?: any[]): Promise<[results: R[], fields: FieldInfo[]]>;

  connect(options?: any): Promise<void>;
  changeUser(options: ConnectionOptions): Promise<void>;
  beginTransaction(options?: QueryOptions): Promise<void>;
  commit(options?: QueryOptions): Promise<void>;
  rollback(options?: QueryOptions): Promise<void>;
  ping(options?: QueryOptions): Promise<void>;
  statistics(options?: QueryOptions): Promise<void>;
  end(options?: any): Promise<void>;

  on(ev: 'drain' | 'connect', callback: () => void): this;
  on(ev: 'end', callback: (err?: MysqlError) => void): this;
  on(ev: 'fields', callback: (fields: any[]) => void): this;
  on(ev: 'error', callback: (err: MysqlError) => void): this;
  on(ev: 'enqueue', callback: (err?: MysqlError) => void): this;
  on(ev: string, callback: (...args: any[]) => void): this;
}

export type AsyncMysqlConnection =
  Omit<Connection, 'connect' | 'changeUser' | 'beginTransaction' | 'commit' | 'rollback' | 'ping' | 'statistics' | 'end' | 'createQuery' | 'query' | 'on'>
  & AsyncMysqlConnectionOperations;

class AsyncMysqlConnectionImpl implements AsyncMysqlConnection {
  public get config(): ConnectionConfig {
    return this.delegate.config;
  }

  public get state(): 'connected' | 'authenticated' | 'disconnected' | 'protocol_error' | string {
    return this.delegate.state;
  }

  public get threadId(): number | null {
    return this.delegate.threadId;
  }

  public constructor(private readonly delegate: Connection) {
  }

  public createQuery(options: string | QueryOptions, values: any): Promise<[results: any, fields: FieldInfo[]]> {
    return new Promise((resolve, reject) =>
      this.delegate.createQuery(options, values, (err, results, fields) => err ? reject(err) : resolve([results, fields!])));
  }

  public query(options: string | QueryOptions, values: any): Promise<[results: any, fields: FieldInfo[]]> {
    return new Promise((resolve, reject) =>
      this.delegate.query(options, values, (err, results, fields) => err ? reject(err) : resolve([results, fields!])));
  }

  public connect(options?: any): Promise<void> {
    return new Promise((resolve, reject) => this.delegate.connect(options, err => err ? reject(err) : resolve()));
  }

  public changeUser(options: ConnectionOptions): Promise<void> {
    return new Promise((resolve, reject) => this.delegate.changeUser(options, err => err ? reject(err) : resolve()));
  }

  public beginTransaction(options?: QueryOptions): Promise<void> {
    return new Promise((resolve, reject) => this.delegate.beginTransaction(options, err => err ? reject(err) : resolve()));
  }

  public commit(options?: QueryOptions): Promise<void> {
    return new Promise((resolve, reject) => this.delegate.commit(options, err => err ? reject(err) : resolve()));
  }

  public rollback(options?: QueryOptions): Promise<void> {
    return new Promise((resolve, reject) => this.delegate.rollback(options, err => err ? reject(err) : resolve()));
  }

  public ping(options?: QueryOptions): Promise<void> {
    return new Promise((resolve, reject) => this.delegate.ping(options, err => err ? reject(err) : resolve()));
  }

  public statistics(options?: QueryOptions): Promise<void> {
    return new Promise((resolve, reject) => this.delegate.statistics(options, err => err ? reject(err) : resolve()));
  }

  public end(options?: any): Promise<void> {
    return new Promise((resolve, reject) => this.delegate.end(options, err => err ? reject(err) : resolve()));
  }

  public destroy(): void {
    this.delegate.destroy();
  }

  public pause(): void {
    this.delegate.pause();
  }

  public resume(): void {
    this.delegate.resume();
  }

  public on(ev: string, callback: (...args: any[]) => void): this {
    this.delegate.on(ev, callback);
    return this;
  }

  public escape(value: any, stringifyObjects?: boolean, timeZone?: string): string {
    return this.delegate.escape(value, stringifyObjects, timeZone);
  }

  public escapeId(value: string, forbidQualified?: boolean): string {
    return this.delegate.escapeId(value, forbidQualified);
  }

  public format(sql: string, values: any[], stringifyObjects?: boolean, timeZone?: string): string {
    return this.delegate.format(sql, values, stringifyObjects, timeZone);
  }
}

async function createConnectionAsync(connectionUri: ConnectionConfig, database: string): Promise<AsyncMysqlConnection> {
  const rawConnection = createConnection({ ...connectionUri, database });
  const connection = new AsyncMysqlConnectionImpl(rawConnection);
  await connection.connect();
  return connection;
}

export async function getTables(connection: AsyncMysqlConnection): Promise<string[]> {
  const [results, fields] = await connection.query<Record<string, string>>('SHOW TABLES');
  const key = fields[0].name;
  return results.map(value => value[key]);
}

export function createConnections(config: Config): Promise<{ master: AsyncMysqlConnection, slave: AsyncMysqlConnection }> {
  return Promise.all([createConnectionAsync(config.master, config.databaseName), createConnectionAsync(config.slave, config.databaseName)])
    .then(([master, slave]) => ({ master, slave }));
}
