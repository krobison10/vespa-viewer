/**
 * Execute a Vespa YQL query against a data source
 */
export async function executeQuery(dataSource, yql, parameters = {}) {
  try {
    // Construct endpoint URL from search_url and search_port
    let endpoint = dataSource.search_url;
    if (dataSource.search_port) {
      endpoint = `${endpoint}:${dataSource.search_port}/search/`;
    }

    const body = {
      yql,
      ...parameters,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to execute Vespa query",
    };
  }
}
