class ApiError extends Error {
    constructor(
        statusCode, 
        message = 'An error occurred', // Default message if none is provided
        errors=[], // Array to hold validation errors or other error details
        stack="",
        isOperational = true // Indicates whether the error is operational or not
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null; // Placeholder for additional data if needed
        this.success = false; // Indicates that the operation was not successful
        this.errors = errors; // Array to hold validation errors or other error details
        this.isOperational = isOperational; // Indicates that this is an operational error


        if (stack) {
            this.stack = stack; // Assign the stack trace if provided
        }else {
            Error.captureStackTrace(this, this.constructor); // Capture the stack trace if not provided
        }
    }
}

export { ApiError };

