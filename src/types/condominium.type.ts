export type Condominium = {
    id: any;
    _id: string,
    condominium_id_imodulo: number,
    name: string,
    cnpj: string,
    cep: string,
    address: string,
    district: string,
    complement?: string,
    city: string,
    state: string,
    screens?: string[],
}