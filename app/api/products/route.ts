import {catalog,json} from '../../../lib/server';
export const dynamic='force-dynamic';
export async function GET(){try{return json({products:(await catalog()).filter(p=>p.active)})}catch{return json({error:'Каталог временно недоступен'},503)}}
