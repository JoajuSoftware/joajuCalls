export interface Usuario {
  id_usuario: string;
  n_usuario: string;
  team: string;
  nro_exten: string;
  nro_agente: string;
  nom: string;
  ape: string;
  acd_predef: string;
  n_perfil: string;
  id_perfil: string;
  activo: string;
  id_team: string;
}

export interface UsuarioResponse {
  err_code: string;
  mensaje: {
    [key: string]: Usuario;
  };
}

export interface createUsuario {
  service: string;
  usuario: string;
  nombre: string;
  apellido: string;
  crea_pass: string;
  crea_pass2: string;
  acd_predef: string;
}

export interface CreateUsuarioResponse {
  err_code: string;
  mensaje: string;
  last_id?: string;
}

export interface updateUsuario {
  service: string;
  id_usuario: string;
  usuario: string;
  nombre: string;
  apellido: string;
  crea_pass: string;
  crea_pass2: string;
  acd_predef: string;
  id_perfil: string;
  agente: string;
  nro_exten: string;
}

export interface TeamInfo {
  id_team: string;
  n_team: string;
}

export interface TeamAclResponse {
  err_code: string;
  mensaje: {
    teams: {
      [key: string]: TeamInfo;
    };
    acl: string[];
    teams_colas: string[];
  };
}
