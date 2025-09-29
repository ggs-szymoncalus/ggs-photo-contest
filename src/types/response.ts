export type SuccessResponse<T> = {
    success: true;
    data: T;
};

export type ErrorResponse = {
    success: false;
    code: string | number;
    error: string;
};

export type ServiceResponse<T> = SuccessResponse<T> | ErrorResponse;
