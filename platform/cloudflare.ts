import {env} from 'cloudflare:workers';
import type {SqlDatabase,SqlValue} from './types';
function connection(){if(!env.DB)throw new Error('D1 binding DB is required');return env.DB;}
export const database:SqlDatabase={
  async query<T>(sql:string,params:SqlValue[]=[]){return (await connection().prepare(sql).bind(...params).all<T>()).results;},
  async execute(sql,params=[]){await connection().prepare(sql).bind(...params).run();},
};
export function runtimeSecret(){return (env as unknown as Record<string,string>).IMPERIA_ADMIN_KEY||'';}
export function requestOrigin(r:Request){return new URL(r.url).origin;}
export function clientIdentifier(r:Request){return r.headers.get('cf-connecting-ip')||'local';}

