require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

const {
  PG_HOST,
  PG_PORT,
  PG_DATABASE,
  PG_USER,
  PG_PASSWORD,
} = process.env;

// Tables to export
const TABLES = ['table1', 'table2', 'table3']; // Replace with your tables

async function getTableColumns(client, tableName) {
  const query = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
    ORDER BY ordinal_position;
  `;
  const res = await client.query(query, [tableName]);
  return res.rows; // each row: {column_name, data_type, is_nullable}
}

function generateCreateTableStatement(tableName, columnsInfo) {
  const colsDefinitions = columnsInfo.map(({ column_name, data_type, is_nullable }) => {
    const nullClause = is_nullable === 'NO' ? 'NOT NULL' : '';
    // For simplicity, data_type is used directly. You may want to refine it.
    return `"${column_name}" ${data_type} ${nullClause}`.trim();
  });

  const colsStr = colsDefinitions.join(',\n    ');
  const createStmt = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n    ${colsStr}\n);\n\n`;
  return createStmt;
}

async function getTableData(client, tableName) {
  const query = `SELECT * FROM "${tableName}"`;
  const res = await client.query(query);
  return { columns: res.fields.map(f => f.name), rows: res.rows };
}

function generateInsertStatements(tableName, columns, rows) {
  const inserts = [];
  for (const row of rows) {
    const valuesList = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) {
        return 'NULL';
      } else if (typeof val === 'string') {
        // Escape single quotes
        const safeVal = val.replace(/'/g, "''");
        return `'${safeVal}'`;
      } else {
        // For numeric, boolean, etc.
        return String(val);
      }
    });

    const colnamesStr = columns.map(c => `"${c}"`).join(', ');
    const valuesStr = valuesList.join(', ');
    const insertStmt = `INSERT INTO "${tableName}" (${colnamesStr}) VALUES (${valuesStr});\n`;
    inserts.push(insertStmt);
  }
  return inserts;
}

async function main() {
  const client = new Client({
    host: PG_HOST,
    port: PG_PORT,
    database: PG_DATABASE,
    user: PG_USER,
    password: PG_PASSWORD,
  });

  await client.connect();

  const writeStream = fs.createWriteStream('output.sql', { encoding: 'utf8' });

  for (const tableName of TABLES) {
    const columnsInfo = await getTableColumns(client, tableName);
    const createStmt = generateCreateTableStatement(tableName, columnsInfo);
    writeStream.write(createStmt);

    const { columns, rows } = await getTableData(client, tableName);
    const insertStmts = generateInsertStatements(tableName, columns, rows);
    for (const stmt of insertStmts) {
      writeStream.write(stmt);
    }
    writeStream.write('\n');
  }

  writeStream.end();
  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
});
