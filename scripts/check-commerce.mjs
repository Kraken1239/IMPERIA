// Integration checks against a disposable loopback preview, never production.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.argv[2]||'http://127.0.0.1:5173';
assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Tests are restricted to a disposable local database');
const key=(await readFile('.dev.vars','utf8')).match(/^IMPERIA_ADMIN_KEY=(.+)$/m)?.[1].trim();
let cookie='';let checks=0;const created=[];
async function req(path,body,auth=false,origin=base){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json',Origin:origin}:{}),...(auth?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={error:text}}return {r,data}}
function ok(a,b){assert.equal(a,b);checks++}
const payload={name:'QA LOCAL TEST',phone:'+7 000 000 00 00',note:'Disposable local integration check',method:'pickup',items:[{id:'pearl',size:'44',qty:1,price:1}],consent:true,website:'',requestKey:crypto.randomUUID()};
try{
 ok((await req('/api/admin')).r.status,401);
 ok((await req('/api/admin',{action:'status',id:'nothing',status:'closed'})).r.status,401);
 ok((await req('/api/admin',{action:'login',key:'wrong'})).r.status,401);
 ok((await req('/api/orders',payload,false,'https://invalid.example')).r.status,403);
 ok((await req('/api/orders',{...payload,consent:false})).r.status,400);
 ok((await req('/api/orders',{...payload,phone:'hello'})).r.status,400);
 ok((await req('/api/orders',{...payload,items:[{id:'pearl',size:'99',qty:1}]})).r.status,400);
 ok((await req('/api/orders',{...payload,items:[{id:'pearl',size:'44',qty:-1}]})).r.status,400);
 ok((await req('/api/orders',{...payload,items:[]})).r.status,400);
 const order=await req('/api/orders',payload);ok(order.r.status,201);assert.match(order.data.id,/^IMP-[A-F0-9]{8}$/);created.push(order.data.id);
 const duplicate=await req('/api/orders',payload);ok(duplicate.data.id,order.data.id);
 const login=await req('/api/admin',{action:'login',key});ok(login.r.status,200);cookie=login.r.headers.get('set-cookie').split(';')[0];assert.ok(login.r.headers.get('set-cookie').includes('HttpOnly'));checks++;
 const admin=await req('/api/admin',null,true);ok(admin.r.status,200);const saved=admin.data.orders.find(o=>o.id===order.data.id);ok(JSON.parse(saved.items)[0].price,null);ok(saved.phone,payload.phone);
 ok((await req('/api/admin',{action:'status',id:order.data.id,status:'contacted'},true)).r.status,200);
 const fitting=await req('/api/orders',{...payload,requestKey:crypto.randomUUID(),method:'fitting',items:[]});ok(fitting.r.status,201);created.push(fitting.data.id);
 const product={id:'qa-local-model',name:'QA local model',category:'fur',material:'QA',color:'QA',colorHex:'#453321',image:'/images/pearl.webp',sizes:['44','46'],price:250000,description:'Disposable fixture',badge:'QA',demo:false,active:true};
 ok((await req('/api/admin',{action:'product',product:{...product,image:'javascript:alert(1)'}},true)).r.status,400);
 ok((await req('/api/admin',{action:'product',product},true)).r.status,200);
 const real=await req('/api/orders',{...payload,requestKey:crypto.randomUUID(),items:[{id:product.id,size:'44',qty:2,price:1}]});ok(real.r.status,201);created.push(real.data.id);
 const realSaved=(await req('/api/admin',null,true)).data.orders.find(o=>o.id===real.data.id);ok(JSON.parse(realSaved.items)[0].price,250000);
 ok((await req('/api/admin',{action:'product',product:{...product,active:false}},true)).r.status,200);
 ok((await req('/api/products')).data.products.length,0);
 ok((await req('/api/orders',{...payload,requestKey:crypto.randomUUID(),items:[{id:product.id,size:'44',qty:1}]})).r.status,400);
 ok((await req('/api/admin',{action:'logout'},true)).r.status,200);
 console.log(`PASS: ${checks} integration checks. Orders persist, prices are server-controlled, duplicate submission is idempotent, admin authentication/CSRF/validation/catalog edits work.`);
}finally{for(const id of created)await req('/api/admin',{action:'delete-order',id},true);console.log('Disposable orders removed. Remove qa-local-model from the disposable local database before continuing preview.');}
