// Node.js runtime for Render. Vite replaces this module with cloudflare.ts on Sites.
import {Pool} from 'pg';
import type {SqlDatabase,SqlValue} from './types';
let pool:Pool|undefined;
function connection(){
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required for persistent storage');
  return pool??=new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:10000,idleTimeoutMillis:30000});
}
function parameters(sql:string){let i=0;return sql.replace(/\?/g,()=>'$'+(++i));}
export const database:SqlDatabase={
  async query<T>(sql:string,params:SqlValue[]=[]){return (await connection().query(parameters(sql),params)).rows as T[];},
  async execute(sql,params=[]){await connection().query(parameters(sql),params);},
};
export function runtimeSecret(){return process.env.IMPERIA_ADMIN_KEY||'';}
export function requestOrigin(r:Request){return new URL(process.env.APP_ORIGIN||process.env.RENDER_EXTERNAL_URL||r.url).origin;}
export function clientIdentifier(r:Request){
  // Render documents X-Forwarded-For for the original visitor address.
  return process.env.RENDER==='true'?(r.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'):'local';
}
