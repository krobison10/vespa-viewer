export const respond = {
  ok(res, statusCode = 200) {
    return res.status(statusCode).json({ status: "ok" });
  },

  message(res, message, statusCode = 200) {
    return res.status(statusCode).json({
      status: "ok",
      message,
    });
  },

  data(res, data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      ...data,
    });
  },

  list(res, { items = [], limit = 0, offset = 0, total = 0 } = {}) {
    return res.status(200).json({
      pagination: {
        limit,
        offset,
        total,
      },
      items,
    });
  },
};
