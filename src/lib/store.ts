import { supabaseStore } from './supabaseStore';
import { demoStore } from './demoStore';
import type { Store } from './types';

const url = import.meta.env.SUPABASE_URL as string | undefined;
const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

export const store: Store = url && key ? supabaseStore(url, key) : demoStore;
export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
