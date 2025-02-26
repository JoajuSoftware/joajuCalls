export interface Cola {
    id: string;
    cola: string;
    n_cola: string;
}
  
export interface ColasApiResponse {
    err_code: string;
    mensaje: Cola[];
}
