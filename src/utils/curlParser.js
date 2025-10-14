/**
 * Parse cURL command to extract API configuration
 * Supports various cURL formats and options
 */
export function parseCurlCommand(curlCommand) {
  try {
    // Remove line breaks and extra spaces, handle backslashes
    const cleanedCurl = curlCommand
      .replace(/\\\r?\n/g, " ") // Remove backslash line continuations
      .replace(/\s+/g, " ")
      .trim();

    // Initialize result
    const result = {
      method: "GET",
      url: "",
      headers: {},
      body: null,
      params: {},
    };

    // Extract URL - handle both --location and -X formats
    let urlMatch = cleanedCurl.match(
      /curl\s+(?:--location\s+)?['"]([^'"]+)['"]/i
    );
    if (!urlMatch) {
      urlMatch = cleanedCurl.match(/curl\s+(?:-X\s+\w+\s+)?['"]([^'"]+)['"]/i);
    }
    if (!urlMatch) {
      urlMatch = cleanedCurl.match(/curl\s+(?:--location\s+)?([^\s'"]+)/i);
    }
    if (!urlMatch) {
      urlMatch = cleanedCurl.match(/curl\s+(?:-X\s+\w+\s+)?([^\s'"]+)/i);
    }

    if (urlMatch) {
      const fullUrl = urlMatch[1];
      // Split URL and query params
      const [baseUrl, queryString] = fullUrl.split("?");
      result.url = baseUrl;

      // Parse query parameters
      if (queryString) {
        const params = new URLSearchParams(queryString);
        params.forEach((value, key) => {
          result.params[key] = value;
        });
      }
    }

    // Extract headers first - support both -H and --header
    const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(cleanedCurl)) !== null) {
      const header = headerMatch[1];
      const [key, ...valueParts] = header.split(":");
      if (key && valueParts.length > 0) {
        result.headers[key.trim()] = valueParts.join(":").trim();
      }
    }

    // Extract method (check after headers for smart detection)
    const methodMatch = cleanedCurl.match(/-X\s+(\w+)/i);
    if (methodMatch) {
      result.method = methodMatch[1].toUpperCase();
    } else {
      // Smart method detection: if content-type is application/json, assume POST
      const contentType = Object.keys(result.headers).find(
        (key) => key.toLowerCase() === "content-type"
      );
      if (
        contentType &&
        result.headers[contentType].includes("application/json")
      ) {
        result.method = "POST";
      }
    }

    // Extract body data - support --data, --data-raw, --data-binary, -d
    // Try to extract the most complete JSON body, including multiline
    let dataMatch = cleanedCurl.match(
      /(?:--data(?:-raw|-binary)?|-d)\s+['"]\s*\{[\s\S]*?\}\s*['"]/i
    );
    if (dataMatch) {
      const bodyData = dataMatch[0].match(/['"]\s*(\{[\s\S]*?\})\s*['"]/)[1];
      try {
        // Clean up the JSON string
        const cleanedBody = bodyData.replace(/\s+/g, " ").trim();
        result.body = JSON.parse(cleanedBody);
      } catch (e) {
        // If JSON parse fails, try to fix common issues
        try {
          const fixedBody = bodyData
            .replace(/(\w+):/g, '"$1":') // Add quotes to keys
            .replace(/'/g, '"') // Replace single quotes with double
            .replace(/,\s*}/g, "}") // Remove trailing commas
            .replace(/,\s*]/g, "]");
          result.body = JSON.parse(fixedBody);
        } catch (e2) {
          result.body = bodyData;
        }
      }
    } else {
      // Fallback to simpler patterns
      dataMatch = cleanedCurl.match(
        /(?:--data(?:-raw|-binary)?|-d)\s+['"](.+?)['"]/i
      );
      if (dataMatch) {
        const bodyData = dataMatch[1];
        try {
          result.body = JSON.parse(bodyData);
        } catch (e) {
          result.body = bodyData;
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error parsing cURL command:", error);
    return null;
  }
}

/**
 * Convert API configuration to cURL command
 */
export function generateCurlCommand(apiConfig) {
  const { method = "GET", url, headers = {}, body, params = {} } = apiConfig;

  let curl = `curl -X ${method}`;

  // Add URL with params
  let fullUrl = url;
  const queryParams = new URLSearchParams(params).toString();
  if (queryParams) {
    fullUrl += `?${queryParams}`;
  }
  curl += ` "${fullUrl}"`;

  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H "${key}: ${value}"`;
  });

  // Add body
  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
    curl += ` \\\n  --data-raw '${bodyStr}'`;
  }

  return curl;
}

/**
 * Clean unnecessary headers (browser-generated headers)
 */
export function cleanHeaders(headers) {
  const unnecessaryHeaders = [
    "accept-language",
    "cache-control",
    "pragma",
    "dnt",
    "origin",
    "referer",
    "sec-ch-ua",
    "sec-ch-ua-mobile",
    "sec-ch-ua-platform",
    "sec-fetch-dest",
    "sec-fetch-mode",
    "sec-fetch-site",
    "user-agent",
    "priority",
    "accept-encoding",
  ];

  const cleaned = {};

  Object.keys(headers).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (!unnecessaryHeaders.includes(lowerKey)) {
      cleaned[key] = headers[key];
    }
  });

  return cleaned;
}

/**
 * Get header importance level
 */
export function getHeaderImportance(key) {
  const essential = ["authorization", "content-type", "cookie"];
  const important = ["accept", "x-api-key", "api-key"];

  const lowerKey = key.toLowerCase();

  if (essential.some((h) => lowerKey.includes(h))) return "essential";
  if (important.some((h) => lowerKey.includes(h))) return "important";
  return "optional";
}

/**
 * Validate API configuration
 */
export function validateApiConfig(apiConfig) {
  const errors = [];

  if (!apiConfig.url) {
    errors.push("URL is required");
  } else {
    try {
      new URL(apiConfig.url);
    } catch (e) {
      errors.push("Invalid URL format");
    }
  }

  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(apiConfig.method)) {
    errors.push("Invalid HTTP method");
  }

  return {
    isValid: errors.length === 0,
    errors,
    headersImportance: Object.entries(apiConfig.headers || {}).reduce(
      (acc, [key, value]) => {
        acc[key] = getHeaderImportance(key);
        return acc;
      },
      {}
    ),
  };
}

/**
 * Test API call
 */
export async function testApiCall(apiConfig) {
  try {
    const { method, url, headers, body, params } = apiConfig;

    // Build URL with params
    let fullUrl = url;
    const queryParams = new URLSearchParams(params).toString();
    if (queryParams) {
      fullUrl += `?${queryParams}`;
    }

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const response = await fetch(fullUrl, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
