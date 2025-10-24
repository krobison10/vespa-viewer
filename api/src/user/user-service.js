import * as userModel from "./user-model.js";

/**
 * Update a user
 *
 * @param {number} uid - The uid of the user to update
 * @param {Object} data - The data to update
 *
 * @returns {Promise<void>} The result of the query
 */
export async function update(uid, data) {
  await userModel.update(uid, data);
}
