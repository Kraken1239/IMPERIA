import {Pool} from 'pg';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
if(!process.env.DATABASE_URL)throw Error('Set DATABASE_URL before starting IMPERIA');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,connectionTimeoutMillis:10000});
const client=await pool.connect();
try{
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(184269327)');
  await client.query('CREATE TABLE IF NOT EXISTS imperia_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
  for(const name of (await readdir(new URL('../db/postgres/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()){
    const sql=await readFile(new URL('../db/postgres/'+name,import.meta.url),'utf8');
    const checksum=createHash('sha256').update(sql).digest('hex');
    const existing=await client.query('SELECT checksum FROM imperia_migrations WHERE name = $1',[name]);
    if(existing.rows.length){if(existing.rows[0].checksum!==checksum)throw Error('Applied migration has changed: '+name);continue;}
    await client.query(sql);
    await client.query('INSERT INTO imperia_migrations (name, checksum) VALUES ($1, $2)',[name,checksum]);
    console.log('Applied migration:',name);
  }
  await client.query('COMMIT');
  console.log('PostgreSQL schema is up to date.');
}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await pool.end();}
