import { getDB } from "../connections/db.js";

/**
 * Get all data sources for a user
 *
 * @param {number} uid - The uid of the user
 *
 * @returns {Promise<Array>} Array of data source objects
 */
export async function getAllByUser(uid) {
  const sql = `
      SELECT * 
      FROM data_sources 
      WHERE uid = $1
      ORDER BY id ASC
    `;

  const { rows } = await getDB().query(sql, [uid]);

  return rows;
}

/**
 * Get a single data source by id
 *
 * @param {number} id - The id of the data source
 * @param {number} uid - The uid of the user (for authorization)
 *
 * @returns {Promise<Object|null>} The data source object if found, null otherwise
 */
export async function getById(id, uid) {
  const sql = `
      SELECT * 
      FROM data_sources 
      WHERE id = $1 AND uid = $2
    `;

  const { rows } = await getDB().query(sql, [id, uid]);

  return rows[0] || null;
}

/**
 * Create a data source
 *
 * @param {number} uid - The uid of the user
 * @param {Object} data - The data source data
 *
 * @returns {Promise<Object>} The created data source object
 */
export async function create(
  uid,
  {
    name,
    searchUrl,
    searchPort,
    documentUrl,
    documentPort,
    configUrl,
    configPort,
  }
) {
  const sql = `
      INSERT INTO data_sources (
        uid, name, search_url, search_port, document_url, document_port, config_url, config_port
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

  const { rows } = await getDB().query(sql, [
    uid,
    name,
    searchUrl,
    searchPort,
    documentUrl,
    documentPort,
    configUrl,
    configPort,
  ]);

  return rows[0];
}

/**
 * Update a data source
 *
 * @param {number} id - The id of the data source to update
 * @param {number} uid - The uid of the user (for authorization)
 * @param {Object} data - The data to update
 *
 * @returns {Promise<Object|null>} The updated data source object
 */
export async function update(
  id,
  uid,
  {
    name,
    searchUrl,
    searchPort,
    documentUrl,
    documentPort,
    configUrl,
    configPort,
  }
) {
  let updateFields = [];
  let params = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${paramIndex}`);
    params.push(name);
    paramIndex++;
  }

  if (searchUrl !== undefined) {
    updateFields.push(`search_url = $${paramIndex}`);
    params.push(searchUrl);
    paramIndex++;
  }

  if (searchPort !== undefined) {
    updateFields.push(`search_port = $${paramIndex}`);
    params.push(searchPort);
    paramIndex++;
  }

  if (documentUrl !== undefined) {
    updateFields.push(`document_url = $${paramIndex}`);
    params.push(documentUrl);
    paramIndex++;
  }

  if (documentPort !== undefined) {
    updateFields.push(`document_port = $${paramIndex}`);
    params.push(documentPort);
    paramIndex++;
  }

  if (configUrl !== undefined) {
    updateFields.push(`config_url = $${paramIndex}`);
    params.push(configUrl);
    paramIndex++;
  }

  if (configPort !== undefined) {
    updateFields.push(`config_port = $${paramIndex}`);
    params.push(configPort);
    paramIndex++;
  }

  // If no fields to update, return early
  if (updateFields.length === 0) {
    return null;
  }

  // Always update the updated_at timestamp
  updateFields.push(`updated_at = NOW()`);

  // Add id and uid to params
  params.push(id);
  const idParamIndex = paramIndex++;
  params.push(uid);
  const uidParamIndex = paramIndex;

  const sql = `
      UPDATE data_sources 
      SET ${updateFields.join(", ")}
      WHERE id = $${idParamIndex} AND uid = $${uidParamIndex}
      RETURNING *
    `;

  const { rows } = await getDB().query(sql, params);

  return rows[0] || null;
}

/**
 * Delete a data source
 *
 * @param {number} id - The id of the data source to delete
 * @param {number} uid - The uid of the user (for authorization)
 *
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
export async function remove(id, uid) {
  const sql = `
      DELETE FROM data_sources 
      WHERE id = $1 AND uid = $2
      RETURNING id
    `;

  const { rows } = await getDB().query(sql, [id, uid]);

  return rows.length > 0;
}

/**
 * Get all consoles for a data source
 */
export async function getAllConsolesByDataSource(dataSourceId, uid) {
  const sql = `
      SELECT c.* 
      FROM consoles c
      INNER JOIN data_sources ds ON c.data_source_id = ds.id
      WHERE c.data_source_id = $1 AND ds.uid = $2
      ORDER BY c.is_default DESC, c.created_at ASC
    `;

  const { rows } = await getDB().query(sql, [dataSourceId, uid]);

  return rows;
}

/**
 * Get a single console by id
 */
export async function getConsoleById(id, uid) {
  const sql = `
      SELECT c.* 
      FROM consoles c
      INNER JOIN data_sources ds ON c.data_source_id = ds.id
      WHERE c.id = $1 AND ds.uid = $2
    `;

  const { rows } = await getDB().query(sql, [id, uid]);

  return rows[0] || null;
}

/**
 * Create a console
 */
export async function createConsole(
  dataSourceId,
  uid,
  { name, isDefault = false }
) {
  // First verify that the data source belongs to the user
  const verifySQL = `SELECT id FROM data_sources WHERE id = $1 AND uid = $2`;
  const { rows: verifyRows } = await getDB().query(verifySQL, [
    dataSourceId,
    uid,
  ]);

  if (verifyRows.length === 0) {
    throw new Error("Data source not found or unauthorized");
  }

  const sql = `
      INSERT INTO consoles (data_source_id, name, is_default) 
      VALUES ($1, $2, $3)
      RETURNING *
    `;

  const { rows } = await getDB().query(sql, [dataSourceId, name, isDefault]);

  return rows[0];
}

/**
 * Update a console
 */
export async function updateConsole(id, uid, { name }) {
  let updateFields = [];
  let params = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${paramIndex}`);
    params.push(name);
    paramIndex++;
  }

  if (updateFields.length === 0) {
    return null;
  }

  updateFields.push(`updated_at = NOW()`);

  params.push(id);
  const idParamIndex = paramIndex++;
  params.push(uid);
  const uidParamIndex = paramIndex;

  const sql = `
      UPDATE consoles c
      SET ${updateFields.join(", ")}
      FROM data_sources ds
      WHERE c.id = $${idParamIndex} 
        AND c.data_source_id = ds.id 
        AND ds.uid = $${uidParamIndex}
      RETURNING c.*
    `;

  const { rows } = await getDB().query(sql, params);

  return rows[0] || null;
}

/**
 * Delete a console (only if it's not the default)
 */
export async function removeConsole(id, uid) {
  const sql = `
      DELETE FROM consoles c
      USING data_sources ds
      WHERE c.id = $1 
        AND c.data_source_id = ds.id 
        AND ds.uid = $2
        AND c.is_default = FALSE
      RETURNING c.id
    `;

  const { rows } = await getDB().query(sql, [id, uid]);

  return rows.length > 0;
}
