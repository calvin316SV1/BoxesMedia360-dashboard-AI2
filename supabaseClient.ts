/**
 * Cliente Supabase
 *
 * Este archivo inicializa una instancia del cliente de Supabase usando las variables
 * definidas en `.env.local`.  Utiliza `import.meta.env` para que Vite pueda inyectar
 * las variables en tiempo de compilación.  Exporta el cliente para que pueda ser
 * reutilizado en cualquier componente o servicio de la aplicación.
 */

import { createClient } from '@supabase/supabase-js';

// Lee las variables de entorno definidas en `.env.local`.  Estas variables deben
// comenzar con `VITE_` para que Vite pueda exponerlas en el frontend.
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crea una instancia del cliente de Supabase.  El cliente puede utilizarse para
// realizar operaciones de lectura y escritura sobre las tablas definidas en tu
// instancia de Supabase, así como gestionar la autenticación.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;