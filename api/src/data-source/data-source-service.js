import * as dataSourceModel from "./data-source-model.js";

/**
 * Get all data sources for a user
 *
 * @param {number} uid - The uid of the user
 *
 * @returns {Promise<Array>} Array of data source objects
 */
export async function getAllByUser(uid) {
  return await dataSourceModel.getAllByUser(uid);
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
  return await dataSourceModel.getById(id, uid);
}

/**
 * Create a data source
 *
 * @param {number} uid - The uid of the user
 * @param {Object} data - The data source data
 *
 * @returns {Promise<Object>} The created data source object
 */
export async function create(uid, data) {
  return await dataSourceModel.create(uid, data);
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
export async function update(id, uid, data) {
  return await dataSourceModel.update(id, uid, data);
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
  return await dataSourceModel.remove(id, uid);
}
