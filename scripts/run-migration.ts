import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  // Read .env.local manually to get DATABASE_URL or POSTGRES_URL
  const envPath = path.join(process.cwd(), '.env.local');
  let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)/) || envContent.match(/POSTGRES_URL=["']?([^"'\n]+)/);
    if (dbUrlMatch) {
      connectionString = dbUrlMatch[1];
    }
  }

  if (!connectionString) {
    console.error("❌ No se encontró DATABASE_URL ni POSTGRES_URL en las variables de entorno.");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20261010_create_gallery.sql');
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Archivo de migración no encontrado en: ${migrationPath}`);
      process.exit(1);
    }
    
    const sqlScript = fs.readFileSync(migrationPath, 'utf8');
    console.log("Ejecutando script SQL...");
    
    await client.query(sqlScript);
    console.log("✅ Migración ejecutada exitosamente en Supabase");
    
  } catch (error) {
    console.error("❌ Error ejecutando la migración:", error);
  } finally {
    await client.end();
  }
}

runMigration();
