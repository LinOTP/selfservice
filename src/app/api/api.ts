export interface LinOTPResponse<T, U = undefined> {
  result?: {
    status: boolean,
    value: T,
    error?: {
      message: string,
    };
  };
  detail?: U;
}

export class APIError extends Error {

  constructor(public response: LinOTPResponse<any, any>) {
    super();
  }
}
