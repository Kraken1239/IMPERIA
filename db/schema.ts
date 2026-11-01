import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', {
 id: text('id').primaryKey(), data: text('data').notNull(), updatedAt: integer('updated_at').notNull(),
});
export const orders = sqliteTable('orders', {
 id: text('id').primaryKey(), requestKey: text('request_key').notNull().unique(),
 name: text('name').notNull(), phone: text('phone').notNull(), items: text('items').notNull(),
 method: text('method').notNull(), note: text('note').notNull(), status: text('status').notNull().default('new'),
 ipHash: text('ip_hash').notNull(), createdAt: integer('created_at').notNull(),
});
