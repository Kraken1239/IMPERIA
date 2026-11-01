import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if(!process.env.IMPERIA_ADMIN_KEY||process.env.IMPERIA_ADMIN_KEY.length<24)throw Error('IMPERIA_ADMIN_KEY must contain at least 24 characters');
await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[fileURLToPath(new URL('./migrate-postgres.mjs',import.meta.url))],{stdio:'inherit'});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('Database migration failed')));});
const child=spawn(process.execPath,[fileURLToPath(new URL('../node_modules/next/dist/bin/next',import.meta.url)),'start','-H','0.0.0.0','-p',process.env.PORT||'10000'],{stdio:'inherit',env:process.env});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.once('error',e=>{console.error(e);process.exit(1)});
child.once('exit',code=>process.exit(code??1));
