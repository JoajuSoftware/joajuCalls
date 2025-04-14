export interface Cartera {
  id_camp: string;
  nom_camp: string;
  cola: string;
  agente: string;
  total: number;
  pendiente: number;
  generada: number;
}

export interface CarteraResponse {
  err_code: string;
  mensaje: Cartera[];
}
