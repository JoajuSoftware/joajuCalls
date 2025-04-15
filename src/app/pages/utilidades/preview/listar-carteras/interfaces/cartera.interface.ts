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

export interface DetalleCartera extends Cartera {
  numero: string;
  fecha: string;
  h_call: string;
  stat: string;
  data_1: string;
  data_2: string;
  data_3: string;
  data_4: string;
  data_5: string;
}

export interface DetalleCarteraResponse {
  err_code: string;
  datos_camp: Cartera;
  mensaje: DetalleCartera[];
}
