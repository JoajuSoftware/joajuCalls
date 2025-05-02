export interface CallInfo {
  numero: string;
  cola: string;
  inicio: string;
  extension: string;
  uniqueid: string;
  grabacion: string;
  canal: string;
  chan_local: string;
  callid: string;
  n_cola: string;
  hasActiveCall?: boolean;
}

export interface AgentCallInfo {
  err_code: string;
  mensaje: {
    nombre: string;
    id_agente: string;
    team: string;
    estado: string;
    callinfo: CallInfo;
    colas: any[];
  };
}
