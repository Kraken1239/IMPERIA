import {store} from '../../../lib/storage';
import {json} from '../../../lib/server';
export const dynamic='force-dynamic';
export async function GET(){try{await store.healthy();return json({status:'ok'});}catch{return json({status:'unavailable'},503);}}
