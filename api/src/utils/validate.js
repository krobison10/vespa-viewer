import { UnprocessableContentError } from "./APIError.js";

export default class Validate {
  static int(value, name = "value") {
    if (value !== undefined && value !== null) {
      // Try to convert to number first if it's a string
      const parsedValue = typeof value === "string" ? Number(value) : value;

      // Check if the result is a valid number and an integer
      if (isNaN(parsedValue) || !Number.isInteger(parseFloat(parsedValue))) {
        throw new UnprocessableContentError(
          `Invalid parameter, expected '${name}' to be an integer, got ${typeof value}`
        );
      }
      return parseInt(parsedValue);
    }
    return parseInt(value);
  }

  static requireInt(value, name = "value") {
    if (value === undefined || value === null) {
      throw new UnprocessableContentError(
        `Missing required parameter '${name}'`
      );
    }
    return Validate.int(value, name);
  }

  static string(value, name = "value") {
    if (value !== undefined && value !== null && typeof value !== "string") {
      throw new UnprocessableContentError(
        `Invalid parameter, expected '${name}' to be a string, got ${value}`
      );
    }
    return value;
  }

  static requireString(value, name = "value") {
    if (value === undefined || value === null) {
      throw new UnprocessableContentError(
        `Missing required parameter '${name}'`
      );
    }

    const string = Validate.string(value, name);
    if (string.length === 0) {
      throw new UnprocessableContentError(`'${name}' cannot be empty`);
    }
    return string;
  }

  static boolean(value, name = "value") {
    if (value !== undefined && value !== null && typeof value !== "boolean") {
      throw new UnprocessableContentError(
        `Invalid parameter, expected '${name}' to be a boolean, got ${value}`
      );
    }
    return value;
  }

  static requireBoolean(value, name = "value") {
    if (value === undefined || value === null) {
      throw new UnprocessableContentError(
        `Missing required parameter '${name}'`
      );
    }
    return Validate.boolean(value, name);
  }

  static array(value, name = "value") {
    if (value !== undefined && value !== null && !Array.isArray(value)) {
      throw new UnprocessableContentError(
        `Invalid parameter, expected '${name}' to be an array, got ${value}`
      );
    }
    return value;
  }

  static requireArray(value, name = "value") {
    if (value === undefined || value === null) {
      throw new UnprocessableContentError(
        `Missing required parameter '${name}'`
      );
    }
    return Validate.array(value, name);
  }

  static object(value, name = "value") {
    if (value !== undefined && value !== null && typeof value !== "object") {
      throw new UnprocessableContentError(
        `Invalid parameter, expected '${name}' to be an object, got ${value}`
      );
    }
    return value;
  }

  static requireObject(value, name = "value") {
    if (value === undefined || value === null) {
      throw new UnprocessableContentError(
        `Missing required parameter '${name}'`
      );
    }
    return Validate.object(value, name);
  }

  static email(value, name = "value") {
    const email = Validate.string(value, name);
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new UnprocessableContentError(`Invalid email address '${email}'`);
    }
    return email;
  }

  static requireEmail(value, name = "value") {
    if (value === undefined || value === null) {
      throw new UnprocessableContentError(
        `Missing required parameter '${name}'`
      );
    }
    return Validate.email(value, name);
  }
}
