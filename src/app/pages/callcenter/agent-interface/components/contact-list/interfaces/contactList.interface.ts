export interface contactListResponse {
    err_code: string;
    mensaje: contactItem[];
}

export interface contactItem {
    nom_camp: string;
    cola: string;
    id: string;
    numero: string;
    stat: string;
    data_1: string;
    data_2: string;
    data_3: string;
    data_4: string;
    data_5: string;
    id_camp: string;
}
