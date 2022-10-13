export type State = {
    id: string;
    sigla: string;
    regiao: {
        id: number;
        sigla: string;
        nome: string;
    }
    nome: string;
}