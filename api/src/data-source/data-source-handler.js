import { respond } from "../utils/respond.js";
import { NotFoundError, BadRequestError } from "../utils/APIError.js";

import * as dataSourceService from "./data-source-service.js";
import * as vespaService from "../vespa/vespa-service.js";

/**
 * Get all data sources for the authenticated user
 */
export async function getAll(req, res, next) {
  try {
    const uid = req.session.uid;

    const items = await dataSourceService.getAllByUser(uid);

    return respond.list(res, { items, total: items.length });
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

    return respond.data(res, { result: dataSource });
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

    return respond.data(res, { result: dataSource });
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

    return respond.data(res, { result: dataSource });
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

/**
 * Get all consoles for a specific data source
 */
export async function getAllConsoles(req, res, next) {
  try {
    const uid = req.session.uid;
    const dataSourceId = parseInt(req.params.dataSourceId);

    if (isNaN(dataSourceId)) {
      throw new BadRequestError("Invalid data source ID");
    }

    const consoles = await dataSourceService.getAllConsolesByDataSource(
      dataSourceId,
      uid
    );

    return respond.data(res, { result: consoles });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single console by id
 */
export async function getConsole(req, res, next) {
  try {
    const uid = req.session.uid;
    const consoleId = req.params.id;
    const dataSourceId = parseInt(req.params.dataSourceId);

    if (isNaN(dataSourceId)) {
      throw new BadRequestError("Invalid data source ID");
    }

    let console;

    // Handle "default" as a special ID to get the default console
    if (consoleId === "default") {
      console = await dataSourceService.getDefaultConsoleByDataSource(
        dataSourceId,
        uid
      );
    } else {
      const id = parseInt(consoleId);
      if (isNaN(id)) {
        throw new BadRequestError("Invalid console ID");
      }
      console = await dataSourceService.getConsoleById(id, uid);
    }

    if (!console) {
      throw new NotFoundError("Console not found");
    }

    return respond.data(res, { result: console });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new console
 */
export async function createConsole(req, res, next) {
  try {
    const uid = req.session.uid;
    const dataSourceId = parseInt(req.params.dataSourceId);
    const { name, is_default } = req.body;

    if (isNaN(dataSourceId)) {
      throw new BadRequestError("Invalid data source ID");
    }

    if (!name) {
      throw new BadRequestError("Console name is required");
    }

    const console = await dataSourceService.createConsole(dataSourceId, uid, {
      name,
      isDefault: is_default || false,
    });

    return respond.data(res, { result: console });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a console
 */
export async function updateConsole(req, res, next) {
  try {
    const uid = req.session.uid;
    const consoleId = req.params.id;
    const dataSourceId = parseInt(req.params.dataSourceId);

    if (isNaN(dataSourceId)) {
      throw new BadRequestError("Invalid data source ID");
    }

    let id;

    // Handle "default" as a special ID to get the default console
    if (consoleId === "default") {
      const defaultConsole =
        await dataSourceService.getDefaultConsoleByDataSource(
          dataSourceId,
          uid
        );
      if (!defaultConsole) {
        throw new NotFoundError("Default console not found");
      }
      id = defaultConsole.id;
    } else {
      id = parseInt(consoleId);
      if (isNaN(id)) {
        throw new BadRequestError("Invalid console ID");
      }
    }

    const { name, console_data } = req.body;

    const console = await dataSourceService.updateConsole(id, uid, {
      name,
      consoleData: console_data,
    });

    if (!console) {
      throw new NotFoundError("Console not found");
    }

    return respond.data(res, { result: console });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a console
 */
export async function removeConsole(req, res, next) {
  try {
    const uid = req.session.uid;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError("Invalid console ID");
    }

    const deleted = await dataSourceService.removeConsole(id, uid);

    if (!deleted) {
      throw new NotFoundError(
        "Console not found or cannot delete default console"
      );
    }

    return respond.ok(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Execute a Vespa query
 */
export async function executeQuery(req, res, next) {
  try {
    const uid = req.session.uid;
    const consoleId = req.params.id;
    const dataSourceId = parseInt(req.params.dataSourceId);

    if (isNaN(dataSourceId)) {
      throw new BadRequestError("Invalid data source ID");
    }

    const { yql, parameters, console_data } = req.body;

    if (!yql) {
      throw new BadRequestError("YQL query is required");
    }

    let id;

    // Handle "default" as a special ID to get the default console
    if (consoleId === "default") {
      const defaultConsole =
        await dataSourceService.getDefaultConsoleByDataSource(
          dataSourceId,
          uid
        );
      if (!defaultConsole) {
        throw new NotFoundError("Default console not found");
      }
      id = defaultConsole.id;
    } else {
      id = parseInt(consoleId);
      if (isNaN(id)) {
        throw new BadRequestError("Invalid console ID");
      }
    }

    // Save console state if provided
    if (console_data) {
      await dataSourceService.updateConsole(id, uid, {
        consoleData: console_data,
      });
    }

    // Get data source
    const dataSource = await dataSourceService.getById(dataSourceId, uid);

    if (!dataSource) {
      throw new NotFoundError("Data source not found");
    }

    // Convert parameters array to object
    const paramsObject = {};
    if (parameters && Array.isArray(parameters)) {
      parameters.forEach((param) => {
        if (param.key && param.value) {
          paramsObject[param.key] = param.value;
        }
      });
    }

    // Enforce hits parameter (default to 400, cap at 400)
    if (paramsObject.hits) {
      const hits = parseInt(paramsObject.hits);
      if (isNaN(hits) || hits < 0) {
        paramsObject.hits = "400";
      } else if (hits > 400) {
        paramsObject.hits = "400";
      }
    } else {
      // Default to 400 if not specified
      paramsObject.hits = "400";
    }

    // Execute Vespa query
    const result = await vespaService.executeQuery(
      dataSource,
      yql,
      paramsObject
    );

    // Save the full result (including status code) to console_data
    if (result) {
      const updatedConsoleData = {
        ...console_data,
        lastResult: result,
      };
      await dataSourceService.updateConsole(id, uid, {
        consoleData: updatedConsoleData,
      });
    }

    // Return the full result (success or error)
    return respond.data(res, { result });
  } catch (error) {
    next(error);
  }
}
