import { Database } from "bun:sqlite";
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Resolve the absolute path for the dbRO directory
const dbPath = resolve(import.meta.dir, '../db');
// Ensure the directory exists
mkdirSync(dbPath, { recursive: true });
// Resolve the full path to the database file
const dbDir = resolve(dbPath, 'snov.db');
if (!existsSync(dbDir)) {
  const dbRW = new Database(dbDir, { create: true });

  try {
    dbRW.exec(`
      CREATE TABLE IF NOT EXISTS snOwners (
        id TEXT PRIMARY KEY,
        txid TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL UNIQUE,
        signed_message TEXT NOT NULL UNIQUE
      )
    `);
  } catch (err) {
    console.log(err)
  }
  dbRW.close();
}

const dbRW = new Database(dbDir);
dbRW.exec("PRAGMA journal_mode = WAL;");

export async function addUserToDB(userID, txid, address, signedMessage) {
  try {
    const dbRes = dbRW.query(
      `INSERT INTO snOwners (id, txid, address, signed_message)
       VALUES (?, ?, ?, ?)`,
    ).run(userID, txid, address, signedMessage);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function removeUserFromDB(userID) {
  try {
    const dbRes = dbRW.query(
      `DELETE FROM snOwners 
       WHERE id = ?`,
    ).run(userID);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getAllUsersDB() {
  try {
    const dbRes = dbRW.query(
      `SELECT id, txid, address, signed_message FROM snOwners`,
    ).all();
    return dbRes;
  } catch (error) {
    console.log(error);
    return false;
  }
}