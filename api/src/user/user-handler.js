import { respond } from "../utils/respond.js";

import * as userService from "./user-service.js";

export async function update(req, res, next) {
  try {
    const uid = req.session.uid;

    await userService.update(uid, req.body);

    return respond.ok(res);
  } catch (error) {
    next(error);
  }
}
