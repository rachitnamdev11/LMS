export const successResponse = (res, data = {}, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const errorResponse = (res, message = 'Something went wrong', status = 500, details) =>
  res.status(status).json({ success: false, message, details });

