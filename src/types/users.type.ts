export type UserType = {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  condominium_id: string[];
  screen_id: string[];
  permission: number;
};

export enum Permission {
  /** Permissão de Zelador.
   * @type {number}
   * */
  ZELADOR = 0,
  /** Permissão de Sindico.
   * @type {number}
   * */
  SINDICO = 1,
  /** Permissão de Administrador.
   * @type {number}
   * */
  ADMIN = 2,
}
