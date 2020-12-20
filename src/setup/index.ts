import { Config } from '../config';
import { createConnections, getTables } from '../shared/database';
import { startReplication } from '../shared/replication';
import { transferTables } from '../shared/dump';
import { log } from '../shared/logging';

export async function setup(config: Config): Promise<void> {
  const { master, slave } = await createConnections(config);

  try {
    log('Stopping existing replication...');
    await master.query('RESET MASTER');
    try {
      await slave.query('STOP SLAVE FOR CHANNEL ?', [config.replicationChannel]);
      await slave.query('RESET SLAVE FOR CHANNEL ?', [config.replicationChannel]);
    } catch (e) {
      // might fail when the channel does not exists before
    }

    const tables = await getTables(master);
    log('Transferring tables:', ...tables);
    await transferTables(config.master, config.slave, config.databaseName, tables, config.mysqlTool, config.dumpTool);

    log('Start replication...');
    await startReplication(master, slave, config.slaveMasterConnection, config.replicationChannel);
    log('Setup replication successful, done.');
  } finally {
    await Promise.all([master.end(), slave.end()]);
  }
}
