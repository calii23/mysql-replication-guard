import { readFileSync } from 'fs';
import { validate } from 'jsonschema';
import { Config } from './types';
import * as schema from './schema.json';

export function readConfig(configFile: string): Config {
  let configString: string;
  try {
    configString = readFileSync(configFile).toString();
  } catch (e) {
    console.error(`${configFile}: ${e.message}`);
    process.exit(1);
  }

  let config: Config;
  try {
    config = JSON.parse(configString);
  } catch (e) {
    console.error(`${configFile}: ${e.message}`);
    process.exit(1);
  }

  const validationResult = validate(config, schema);

  if (!validationResult.valid) {
    validationResult.errors.forEach(error => console.error(`${configFile}: ${error}`));
    process.exit(1);
  }

  return config;
}
