import { getDB } from "../connections/db.js";

/**
 * Find a user by their uid
 *
 * @param {number} uid - The uid of the user to search for
 *
 * @returns {Promise<Object|null>} The user object if found, null otherwise
 */
export async function get(uid) {
  const sql = `
      SELECT * 
      FROM users 
      WHERE uid = $1
    `;

  const { rows } = await getDB().query(sql, [uid]);

  return rows[0] || null;
}

/**
 * Find a user by their email address
 *
 * @param {string} email - The email address to search for
 *
 * @returns {Promise<Object|null>} The user object if found, null otherwise
 */
export async function getByEmail(email) {
  const sql = `
      SELECT * FROM users 
      WHERE email = $1
    `;

  const { rows } = await getDB().query(sql, [email]);

  return rows[0] || null;
}

/**
 * Create a user
 *
 * @param {string} email - The email of the user to create
 *
 * @returns {Promise<Object>} The user object
 */
export async function create(email) {
  const sql = `
      INSERT INTO users (email) 
      VALUES ($1)
      RETURNING *
    `;

  const { rows } = await getDB().query(sql, [email]);

  return rows[0];
}

/**
 * Update a user
 *
 * @param {number} uid - The uid of the user to update
 * @param {Object} data - The data to update
 *
 * @returns {Promise<void>} The result of the query
 */
export async function update(uid, { name } = {}) {
  let updateFields = [];
  let params = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${paramIndex}`);
    params.push(name);
    paramIndex++;
  }

  // If no fields to update, return early
  if (updateFields.length === 0) {
    return;
  }

  // Add uid to params
  params.push(uid);

  const sql = `
      UPDATE users 
      SET ${updateFields.join(", ")}
      WHERE uid = $${paramIndex} 
    `;

  await getDB().query(sql, params);
}

/**
 * Update the last seen timestamp for a user
 *
 * @param {number} uid - The uid of the user to update
 *
 * @returns {Promise<Object>} The result of the query
 */
export async function updateLastSeen(uid) {
  const sql = `
      UPDATE users
      SET last_seen = NOW()
      WHERE uid = $1
    `;

  return await getDB().query(sql, [uid]);
}
