import { StrictConnectionConfig } from '../config';
import { exec } from 'child_process';

function escapeArg(value: string): string {
  return value.replace(/"/g, '\\""');
}

function createOption(option: string, value?: string): string {
  if (!value) return '';
  return `"--${option}=${escapeArg(value)}"`;
}

export async function transferTables(source: StrictConnectionConfig,
  destination: StrictConnectionConfig,
  database: string,
  tables: string[],
  mysqlTool: string,
  dumpTool: string): Promise<void> {
  const dumpArgs = [createOption('host', source.host),
    createOption('user', source.user),
    createOption('password', source.password)];
  const dumpCommand = `${dumpTool} ${dumpArgs.join(' ')} --opt --skip-comments --single-transaction --protocol=tcp ${database} ${tables.map(value => `"${escapeArg(value)}"`).join(' ')}`;

  const mysqlArgs = [createOption('host', destination.host),
    createOption('user', destination.user),
    createOption('password', destination.password),
    createOption('database', database)];
  const mysqlCommand = `${mysqlTool} ${mysqlArgs.join(' ')} --protocol=tcp`;

  const transferProcess = exec(`${dumpCommand} | ${mysqlCommand}`, { shell: '/bin/sh' });
  transferProcess.stdout!.pipe(process.stdout, { end: false });
  transferProcess.stderr!.pipe(process.stderr, { end: false });

  await new Promise(resolve => transferProcess.on('exit', resolve));
}
