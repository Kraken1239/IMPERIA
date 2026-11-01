import {database} from '@imperia/runtime';
import type {Product} from './catalog';
export type OrderRow={id:string;requestKey:string;name:string;phone:string;items:string;method:string;note:string;status:string;ipHash:string;createdAt:number};
export const store={
  async products(){return database.query<{data:string}>('SELECT data FROM products ORDER BY updated_at, id');},
  async orderByKey(key:string){return (await database.query<{id:string}>('SELECT id FROM orders WHERE request_key = ? LIMIT 1',[key]))[0];},
  async recentOrders(ipHash:string,since:number){const [row]=await database.query<{n:number|string}>('SELECT COUNT(*) AS n FROM orders WHERE ip_hash = ? AND created_at >= ?',[ipHash,since]);return Number(row.n);},
  async createOrder(o:OrderRow){await database.execute('INSERT INTO orders (id, request_key, name, phone, items, method, note, status, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (request_key) DO NOTHING',[o.id,o.requestKey,o.name,o.phone,o.items,o.method,o.note,o.status,o.ipHash,o.createdAt]);return (await this.orderByKey(o.requestKey))!.id;},
  async orders(){const rows=await database.query<Omit<OrderRow,'requestKey'|'ipHash'>>('SELECT id, name, phone, items, method, note, status, created_at AS "createdAt" FROM orders ORDER BY created_at DESC LIMIT 500');return rows.map(o=>({...o,createdAt:Number(o.createdAt)}));},
  async updateStatus(id:string,status:string){await database.execute('UPDATE orders SET status = ? WHERE id = ?',[status,id]);},
  async deleteOrder(id:string){await database.execute('DELETE FROM orders WHERE id = ?',[id]);},
  async saveProduct(p:Product){await database.execute('INSERT INTO products (id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at',[p.id,JSON.stringify(p),Date.now()]);},
  async healthy(){await database.query('SELECT 1 AS ok');},
};
