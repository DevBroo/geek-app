class ApiResponse {
  constructor(status, message = "Success", data) {
    this.status = status;
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static success(message, data = null) {
    return new ApiResponse('success', message, data);
  }

  static error(message, data = null) {
    return new ApiResponse('error', message, data);
  }
}

export { ApiResponse };