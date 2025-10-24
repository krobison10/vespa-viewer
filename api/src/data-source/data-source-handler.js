import { respond } from "../utils/respond.js";
import { NotFoundError, BadRequestError } from "../utils/APIError.js";

import * as dataSourceService from "./data-source-service.js";

/**
 * Get all data sources for the authenticated user
 */
export async function getAll(req, res, next) {
  try {
    const uid = req.session.uid;

    const dataSources = await dataSourceService.getAllByUser(uid);

    return respond.data(res, { dataSources });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single data source by id
 */
export async function getOne(req, res, next) {
  try {
    const uid = req.session.uid;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError("Invalid data source ID");
    }

    const dataSource = await dataSourceService.getById(id, uid);

    if (!dataSource) {
      throw new NotFoundError("Data source not found");
    }

    return respond.data(res, { dataSource });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new data source
 */
export async function create(req, res, next) {
  try {
    const uid = req.session.uid;

    const {
      name,
      search_url,
      search_port,
      document_url,
      document_port,
      config_url,
      config_port,
    } = req.body;

    if (!name) {
      throw new BadRequestError("Data source name is required");
    }

    const dataSource = await dataSourceService.create(uid, {
      name,
      searchUrl: search_url,
      searchPort: search_port,
      documentUrl: document_url,
      documentPort: document_port,
      configUrl: config_url,
      configPort: config_port,
    });

    return respond.data(res, { dataSource });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a data source
 */
export async function update(req, res, next) {
  try {
    const uid = req.session.uid;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError("Invalid data source ID");
    }

    const {
      name,
      search_url,
      search_port,
      document_url,
      document_port,
      config_url,
      config_port,
    } = req.body;

    const dataSource = await dataSourceService.update(id, uid, {
      name,
      searchUrl: search_url,
      searchPort: search_port,
      documentUrl: document_url,
      documentPort: document_port,
      configUrl: config_url,
      configPort: config_port,
    });

    if (!dataSource) {
      throw new NotFoundError("Data source not found");
    }

    return respond.data(res, { dataSource });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a data source
 */
export async function remove(req, res, next) {
  try {
    const uid = req.session.uid;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError("Invalid data source ID");
    }

    const deleted = await dataSourceService.remove(id, uid);

    if (!deleted) {
      throw new NotFoundError("Data source not found");
    }

    return respond.ok(res);
  } catch (error) {
    next(error);
  }
}
