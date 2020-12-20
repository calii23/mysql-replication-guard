import { AsyncMysqlConnection } from '../shared/database';

async function checksumTables(connection: AsyncMysqlConnection, tables: string[]): Promise<Record<string, number>> {
  const query = `CHECKSUM TABLE ${tables.map(table => connection.escapeId(table)).join(', ')}`;
  const [results] = await connection.query<{ Table: string, Checksum: number }>(query);
  const data: Record<string, number> = {};
  results.forEach(({ Table, Checksum }) => data[Table.substring(Table.indexOf('.') + 1)] = Checksum);
  return data;
}

export async function compareTables(connection1: AsyncMysqlConnection, connection2: AsyncMysqlConnection, tables: string[]): Promise<string[]> {
  const [checksum1, checksum2] = await Promise.all([
    checksumTables(connection1, tables),
    checksumTables(connection2, tables),
  ]);

  return tables.filter(table => checksum1[table] !== checksum2[table]);
}

