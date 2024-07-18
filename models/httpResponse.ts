export type HttpResponseWrapper<Data> = {
    httpStatus: number
    data?: Data
    errMsg?: string
};