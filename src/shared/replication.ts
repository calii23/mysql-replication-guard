import { AsyncMysqlConnection } from './database';
import { SlaveMasterConnection } from '../config';

export async function startReplication(master: AsyncMysqlConnection, slave: AsyncMysqlConnection, slaveMasterConnection: SlaveMasterConnection, channel: string): Promise<void> {
  const [[masterStatus]] = await master.query<{ File: string, Position: number }>('SHOW MASTER STATUS');

  await slave.query('CHANGE MASTER TO MASTER_HOST = ?, MASTER_PORT = ?, MASTER_USER = ?, MASTER_PASSWORD = ?, MASTER_LOG_FILE = ?, MASTER_LOG_POS = ? FOR CHANNEL ?', [
    slaveMasterConnection.host,
    slaveMasterConnection.port ?? 3306,
    slaveMasterConnection.user,
    slaveMasterConnection.password,
    masterStatus.File,
    masterStatus.Position,
    channel,
  ]);
  await slave.query('START SLAVE FOR CHANNEL ?', [channel]);
}
