import { getDB } from "../connections/db.js";

/**
 * Get credentials for a user
 *
 * @param {number} uid - The uid of the user to get credentials for
 *
 * @returns {Promise<Object>} The credentials object
 */
export async function getCredentials(uid) {
  const sql = `
      SELECT hash, salt 
      FROM credentials 
      WHERE uid = $1
    `;

  const { rows } = await getDB().query(sql, [uid]);

  return rows[0];
}

/**
 * Create credentials for a user
 *
 * @param {number} uid - The uid of the user to create credentials for
 * @param {string} hash - The hash of the user's password
 * @param {string} salt - The salt of the user's password
 */
export async function createCredentials(uid, hash, salt) {
  const sql = `
      INSERT INTO credentials (uid, hash, salt) 
      VALUES ($1, $2, $3)
      ON CONFLICT (uid) DO UPDATE SET hash = $2, salt = $3
    `;

  await getDB().query(sql, [uid, hash, salt]);
}
