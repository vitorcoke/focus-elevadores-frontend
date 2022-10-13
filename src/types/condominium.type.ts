export type Condominium = {
    _id: string,
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