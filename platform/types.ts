export type SqlValue = string | number | null;
export interface SqlDatabase {
  query<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  execute(sql: string, params?: SqlValue[]): Promise<void>;
}
