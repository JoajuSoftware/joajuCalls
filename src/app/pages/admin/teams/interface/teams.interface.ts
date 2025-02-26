export interface Team {
  id_team?: string;
  n_team: string;
}

export interface TeamResponse {
  err_code: string;
  mensaje: Team[];
}
