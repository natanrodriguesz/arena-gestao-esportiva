import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const teamWorkspaces=sqliteTable('team_workspaces',{owner:text('owner').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(0)});
