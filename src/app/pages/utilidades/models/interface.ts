export interface Data { 
  initDate: string;
  endDate: string;
  queues: string | string[];
}

export interface ResponseInterface<T> { 
  err_code: string;
  mensaje: T[];
}

export interface CallData { 
  callid: string;
  estado: string;
  datetime_ini: string;
  datetime_fin: string;
  num: string;
  espera: string;
  duracion: string;
  grabacion: string;
  n_agente: string;
  cola: string;
  n_cola: string;
}

export interface AgentData { 
  agente: string;
  n_agente: string;
  cola: string;
  terminada: string;
  activas: string;
  dur_mayor_15: string;
  dur_min_15: string;
  dur_mayor_60: string;
  dur_min_60: string;
  wait_max_15: string;
  wait_min_15: string;
  dur_avg: string;
  conversacion: string;
  dur_min: string;  
  dur_max: string;
}

export interface QueueData { 
  cola: string;
  n_cola: string;
  terminada: string;
  activas: string;
  duracion_mayor_15: string;
  duracion_min_15: string;
  duracion_mayor_60: string;
  duracion_min_60: string;
  espera_max_15: string;
  espera_min_15: string;
  duracion_avg: string;
  conversacion: string;
  espera_min: string;  
  espera_max: string;
}

export interface QueueMonitoringData { 
  exten: string;
  agente: string;
  estado: string;
}

export interface ConnectionAgentData {
  id_agente: string;
  agente: string;
  n_agente: string;
  tipo_descanso: string;
  descanso: string;
  inicio: string;
  fin: string;
  n_team: string;
  tiempo: string;
}