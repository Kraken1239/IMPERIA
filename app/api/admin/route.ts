import {admin,json,sameOrigin,secret,equal,session,catalog} from '../../../lib/server';
import {getDb} from '../../../db';
import {orders,products} from '../../../db/schema';
import {eq,desc} from 'drizzle-orm';
export async function GET(r:Request){if(!await admin(r))return json({error:'Необходим вход'},401);return json({orders:await getDb().select({id:orders.id,name:orders.name,phone:orders.phone,items:orders.items,method:orders.method,note:orders.note,status:orders.status,createdAt:orders.createdAt}).from(orders).orderBy(desc(orders.createdAt)).limit(500),products:await catalog()})}
export async function POST(r:Request){
 if(!sameOrigin(r))return json({error:'Недопустимый источник'},403);
 try{const raw=await r.text();if(raw.length>18000)return json({error:'Слишком большой запрос'},413);const b=JSON.parse(raw);
 if(b.action==='login'){if(secret().length<24)return json({error:'Ключ администратора не настроен'},503);if(typeof b.key!=='string'||!equal(await hash(b.key),await hash(secret())))return json({error:'Неверный ключ'},401);return Response.json({ok:true},{headers:{'Set-Cookie':`imperia_admin=${await session()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${new URL(r.url).protocol==='https:'?'; Secure':''}`,'Cache-Control':'no-store'}})}
 if(!await admin(r))return json({error:'Необходим вход'},401);
 const db=getDb();
 if(b.action==='logout')return Response.json({ok:true},{headers:{'Set-Cookie':'imperia_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'}});
 if(b.action==='status'&&['new','contacted','confirmed','closed'].includes(b.status)&&typeof b.id==='string'){await db.update(orders).set({status:b.status}).where(eq(orders.id,b.id));return json({ok:true})}
 if(b.action==='delete-order'&&typeof b.id==='string'){await db.delete(orders).where(eq(orders.id,b.id));return json({ok:true})}
 if(b.action==='product'){
  const p=b.product;
  if(!p||typeof p.id!=='string'||!/^[a-z0-9-]{1,64}$/.test(p.id)||typeof p.name!=='string'||p.name.length<2||p.name.length>100||!['fur','shearling','vest'].includes(p.category)||!Array.isArray(p.sizes)||!p.sizes.length||p.sizes.length>20||p.sizes.some((s:unknown)=>typeof s!=='string'||!/^\d{2}$/.test(s))||!(p.price===null||(Number.isInteger(p.price)&&p.price>0&&p.price<=100000000))||typeof p.image!=='string'||p.image.length>2000||!(/^\/images\/[a-z0-9.-]+$/i.test(p.image)||/^https:\/\/[^\s]+$/i.test(p.image))||typeof p.description!=='string'||p.description.length>2000||typeof p.color!=='string'||p.color.length>60||typeof p.material!=='string'||p.material.length>100||typeof p.badge!=='string'||p.badge.length>60||!/^#[a-f0-9]{6}$/i.test(p.colorHex)||typeof p.demo!=='boolean'||typeof p.active!=='boolean')return json({error:'Проверьте данные товара: фото HTTPS, размеры через запятую, положительная цена.'},400);
  const clean={id:p.id,name:p.name.trim(),category:p.category,material:p.material.trim(),color:p.color.trim(),colorHex:p.colorHex,image:p.image,sizes:[...new Set(p.sizes)],price:p.price,description:p.description.trim(),badge:p.badge.trim(),demo:p.demo,active:p.active};
  await db.insert(products).values({id:p.id,data:JSON.stringify(clean),updatedAt:Date.now()}).onConflictDoUpdate({target:products.id,set:{data:JSON.stringify(clean),updatedAt:Date.now()}});return json({ok:true});
 }
 return json({error:'Неизвестное действие'},400);
 }catch{return json({error:'Операция не выполнена. Повторите попытку.'},503)}
}
async function hash(s:string){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
