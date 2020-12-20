import * as yargs from 'yargs';
import { readConfig } from './config';

yargs
  .string('config')
  .describe('config', 'Path to the config file')
  .alias('c', 'config')
  .demandOption('config')
  .command('setup', 'Setup the master-slave', () => {
  }, argv => {
    console.log('setup', argv);
  })
  .command('verify', 'Verifies that the tables in the slave are equivalent to the master\'s tables', () => {
  }, argv => {
    console.log('verify', argv);
    const config = readConfig(argv.config);
  })
  .strict()
  .parse(process.argv.slice(2));

