// Local-only disposable PostgreSQL preview; never used by Render.
import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const local=await readFile(new URL('../.dev.vars',import.meta.url),'utf8');
const key=local.match(/^IMPERIA_ADMIN_KEY=(.+)$/m)?.[1].trim();
const db=await PGlite.create();
const server=new PGLiteSocketServer({db,host:'127.0.0.1',port:55439,maxConnections:10});
await server.start();
const child=spawn(process.execPath,['scripts/start-render.mjs'],{stdio:'inherit',env:{...process.env,DATABASE_URL:'postgresql://postgres:postgres@127.0.0.1:55439/postgres',IMPERIA_ADMIN_KEY:key,PORT:'10000',APP_ORIGIN:'http://127.0.0.1:10000'}});
let stopping=false;
async function stop(){if(stopping)return;stopping=true;child.kill('SIGTERM');await server.stop();await db.close();}
process.on('SIGINT',async()=>{await stop();process.exit(0)});
process.on('SIGTERM',async()=>{await stop();process.exit(0)});
child.once('exit',async code=>{await stop();process.exit(code??1)});
