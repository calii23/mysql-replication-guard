import * as yargs from 'yargs';
import { Config, readConfig } from './config';
import { verify } from './verify';
import { setup } from './setup';
import { initMailLogging, thrownError } from './shared/logging';
import { notify } from './notify';

function runCommand(configPath: string, handler: (config: Config) => Promise<void>) {
  const config = readConfig(configPath);
  if (config.mail) {
    initMailLogging(config.mail);
  }

  handler(config)
    .catch(reason => {
      thrownError('Executing command', reason);
      process.exit(1);
    });
}

yargs
  .string('config')
  .describe('config', 'Path to the config file')
  .alias('c', 'config')
  .demandOption('config')
  .command({
    command: 'setup',
    aliases: ['s'],
    describe: 'Setup the master-slave',
    handler: args => runCommand(args.config as string, setup),
  })
  .command({
    command: 'verify',
    aliases: ['v'],
    describe: 'Verifies that the tables in the slave are equivalent to the master\'s tables',
    handler: args => runCommand(args.config as string, verify),
  })
  .command({
    command: 'notify <text>',
    aliases: ['n'],
    describe: 'Send a mail to the sender configured. This can be used by other processes to report errors.',
    builder: {
      text: {
        type: 'string',
        demandOption: true,
      },
    },
    handler: args => runCommand(args.config as string, config => notify(config, args.text as string)),
  })
  .strict()
  .parse(process.argv.slice(2));

