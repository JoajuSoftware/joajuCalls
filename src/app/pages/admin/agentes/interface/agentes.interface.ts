// La interfaz principal que usas en tu componente para mostrar los datos
export interface Agent {
  agente: string;
  nombre: string;
  exten: number;
  team: string;
  estado: string;
}

// La interfaz que representa la respuesta cruda de cada agente desde la API
export interface AgentResponse {
  exten: string;
  agente: string;
  estado: string;
  nombre: string;
  team: string;
  id: string;
}

// La interfaz que representa la estructura completa de la respuesta de la API
export interface AgentsApiResponse {
  err_code: string;
  mensaje: AgentResponse[];
  Libres: string;
}
