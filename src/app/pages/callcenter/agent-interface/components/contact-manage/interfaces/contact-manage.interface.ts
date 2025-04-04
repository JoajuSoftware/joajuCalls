export interface ContactResponse {
    err_code: string;
    mensaje: ContactManage[];
}

export interface ContactManage {
    id_camp: string;
    id: string;
    numero: string;
    stat: string;
    nom_camp: string;
    data_1: string;
    data_2: string;
    data_3: string;
    data_4: string;
    data_5: string;
    cc_id: string;
    h_call: string;
}
