import { Config } from '../config';
import { createConnections, getTables } from '../shared/database';
import { compareTables } from './checksum';
import { transferTables } from '../shared/dump';
import { startReplication } from '../shared/replication';
import { error, log, sendLogsByMail } from '../shared/logging';

export async function verify(config: Config): Promise<void> {
  const { master, slave } = await createConnections(config);

  try {
    const tables = config.tables === 'all' ? await getTables(master) : config.tables;
    const brokenTables = await compareTables(master, slave, tables);

    if (brokenTables.length === 0) {
      log('Master and slave tables are equal, nothing to do.');
      return;
    }

    log('Some tables are not equal:', ...brokenTables);
    sendLogsByMail();
    await slave.query('STOP SLAVE FOR CHANNEL ?', [config.replicationChannel]);
    await slave.query('RESET SLAVE FOR CHANNEL ?', [config.replicationChannel]);

    await transferTables(config.master, config.slave, config.databaseName, brokenTables, config.mysqlTool, config.dumpTool);

    const stillBrokenTables = await compareTables(master, slave, tables);

    if (stillBrokenTables.length !== 0) {
      error('There are still broken table after fixing, abort.', ...stillBrokenTables);
      return;
    }

    log('Tables are fixed.');

    await master.query('RESET MASTER');
    await startReplication(master, slave, config.slaveMasterConnection, config.replicationChannel);

    log('Replication restarted, done.');
  } finally {
    await Promise.all([master.end(), slave.end()]);
  }
}
