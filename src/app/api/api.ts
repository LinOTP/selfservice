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
