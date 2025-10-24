import * as dataSourceModel from "./data-source-model.js";

/**
 * Get all data sources for a user
 *
 * @param {number} uid - The uid of the user
 *
 * @returns {Promise<Array>} Array of data source objects with consoles
 */
export async function getAllByUser(uid) {
  const dataSources = await dataSourceModel.getAllByUser(uid);

  // Get consoles for each data source
  const dataSourcesWithConsoles = await Promise.all(
    dataSources.map(async (dataSource) => ({
      ...dataSource,
      consoles: await dataSourceModel.getAllConsolesByDataSource(
        dataSource.id,
        uid
      ),
    }))
  );

  return dataSourcesWithConsoles;
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
  const dataSource = await dataSourceModel.create(uid, data);

  // Create a default console for the new data source
  await createDefaultConsole(dataSource.id, uid);

  return dataSource;
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

export async function getAllConsolesByDataSource(dataSourceId, uid) {
  return await dataSourceModel.getAllConsolesByDataSource(dataSourceId, uid);
}

export async function getConsoleById(id, uid) {
  return await dataSourceModel.getConsoleById(id, uid);
}

export async function getDefaultConsoleByDataSource(dataSourceId, uid) {
  return await dataSourceModel.getDefaultConsoleByDataSource(dataSourceId, uid);
}

export async function createConsole(dataSourceId, uid, data) {
  return await dataSourceModel.createConsole(dataSourceId, uid, data);
}

export async function createDefaultConsole(dataSourceId, uid) {
  return await dataSourceModel.createConsole(dataSourceId, uid, {
    name: "Default",
    isDefault: true,
  });
}

export async function updateConsole(id, uid, data) {
  return await dataSourceModel.updateConsole(id, uid, data);
}

export async function removeConsole(id, uid) {
  return await dataSourceModel.removeConsole(id, uid);
}
