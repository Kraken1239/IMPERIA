import {catalog,digest,json,sameOrigin} from '../../../lib/server';
import {store} from '../../../lib/storage';
import {clientIdentifier} from '@imperia/runtime';
export async function POST(r:Request){
 if(!sameOrigin(r))return json({error:'Недопустимый источник запроса'},403);
 if(Number(r.headers.get('content-length')||0)>12000)return json({error:'Слишком большой запрос'},413);
 try{
  const raw=await r.text();if(raw.length>12000)return json({error:'Слишком большой запрос'},413);const b=JSON.parse(raw);
  if(b.website||b.consent!==true||typeof b.name!=='string'||b.name.trim().length<2||b.name.length>80||typeof b.phone!=='string'||!/^[+\d\s()-]{10,25}$/.test(b.phone)||b.phone.replace(/\D/g,'').length<10||b.phone.replace(/\D/g,'').length>15||!['fitting','pickup','delivery'].includes(b.method)||typeof b.requestKey!=='string'||! /^[a-z0-9-]{36}$/i.test(b.requestKey)||typeof b.note!=='string'||b.note.length>1000||!Array.isArray(b.items)||b.items.length>30)return json({error:'Проверьте имя, телефон и согласие на обработку данных.'},400);
  const ipHash=await digest(clientIdentifier(r)+new Date().toISOString().slice(0,10));
  const requestKey=await digest(b.requestKey+':'+b.phone.replace(/\D/g,''));const existing=await store.orderByKey(requestKey);if(existing)return json({id:existing.id});
  if(await store.recentOrders(ipHash,Date.now()-3600000)>=10)return json({error:'Слишком много заявок. Пожалуйста, напишите консультанту в WhatsApp.'},429);
  const all=await catalog();const items=[];
  for(const i of b.items){const p=all.find(p=>p.id===i.id&&p.active);if(!p||typeof i.size!=='string'||!p.sizes.includes(i.size)||!Number.isInteger(i.qty)||i.qty<1||i.qty>10)return json({error:'Модель или размер изменились. Обновите подборку и попробуйте снова.'},400);items.push({id:p.id,name:p.name,size:i.size,qty:i.qty,price:p.price,demo:p.demo})}
  if(items.length===0&&b.method!=='fitting')return json({error:'Добавьте модель в подборку или запишитесь на примерку.'},400);
  const id='IMP-'+crypto.randomUUID().slice(0,8).toUpperCase();
  const savedId=await store.createOrder({id,requestKey,name:b.name.trim(),phone:b.phone.trim(),method:b.method,note:b.note.trim(),items:JSON.stringify(items),ipHash,createdAt:Date.now(),status:'new'});
  return json({id:savedId},201);
 }catch(e){console.error('Order submission failed',e instanceof Error?e.name:'unknown');return json({error:'Не удалось сохранить заявку. Повторите попытку или напишите нам в WhatsApp.'},503)}
}
