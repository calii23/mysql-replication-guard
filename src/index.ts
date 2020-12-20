import * as yargs from 'yargs';
import { readConfig } from './config';
import { verify } from './verify';
import { setup } from './setup';

yargs
  .string('config')
  .describe('config', 'Path to the config file')
  .alias('c', 'config')
  .demandOption('config')
  .command({
    command: 'setup',
    aliases: ['s'],
    describe: 'Setup the master-slave',
    handler: args => setup(readConfig(args.config as string))
      .catch(reason => {
        console.error(reason);
        process.exit(1);
      }),
  })
  .command({
    command: 'verify',
    aliases: ['v'],
    describe: 'Verifies that the tables in the slave are equivalent to the master\'s tables',
    handler: args => verify(readConfig(args.config as string))
      .catch(reason => {
        console.error(reason);
        process.exit(1);
      }),
  })
  .strict()
  .parse(process.argv.slice(2));

