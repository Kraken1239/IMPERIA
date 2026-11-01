import {env} from 'cloudflare:workers';
import {getDb} from '../db';
import {products} from '../db/schema';
import {samples,type Product} from './catalog';
export async function catalog():Promise<Product[]> {const rows=await getDb().select().from(products);return rows.length?rows.map(r=>JSON.parse(r.data) as Product):samples;}
export function sameOrigin(r:Request){return r.headers.get('origin')===new URL(r.url).origin;}
export function secret(){return (env as unknown as Record<string,string>).IMPERIA_ADMIN_KEY||'';}
export async function digest(s:string){const a=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(a)).map(v=>v.toString(16).padStart(2,'0')).join('');}
async function sign(s:string){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['sign']);const b=await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(v=>v.toString(16).padStart(2,'0')).join('');}
export async function session(){const expires=String(Date.now()+1000*60*60*12);return `${expires}.${await sign(expires)}`;}
export async function admin(r:Request){if(secret().length<24)return false;const cookie=r.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('imperia_admin='))?.split('=')[1];if(!cookie)return false;const [exp,sig]=cookie.split('.');if(!exp||!sig||!/^\d+$/.test(exp)||Number(exp)<Date.now()||Number(exp)>Date.now()+1000*60*60*13)return false;return equal(sig,await sign(exp));}
export function equal(a:string,b:string){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
