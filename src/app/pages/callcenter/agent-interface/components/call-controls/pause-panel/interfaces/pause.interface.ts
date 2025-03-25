export interface Pause {
    agente:     string;
    ag_pass:    string;
    reason:     string;
}

export interface checkAgentStatusResponse {
    err_code: string;
    mensaje:   agentItem[];
}

export interface agentItem {
    agente: string;
    exten: string;
    nombre: string;
    team:  string;
    id:   string;
    estado: string;
    info_pausa?: infoPaused;
}

interface infoPaused {
    inicio: string;
    pausa: string;
}

