-- Schema para PWA de Contenedores (PostgreSQL)
-- Base de datos para gestión de recursos educativos y suscripciones push

-- Crear tipo ENUM para categorías
DO $$ BEGIN
  CREATE TYPE categoria_tipo AS ENUM ('Docker', 'Kubernetes', 'Docker Compose');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabla de recursos educativos
CREATE TABLE IF NOT EXISTS recursos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria categoria_tipo NOT NULL,
  url VARCHAR(500) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice en categoria para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_recursos_categoria ON recursos(categoria);

-- Tabla de suscripciones push
CREATE TABLE IF NOT EXISTS suscripciones (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(500) NOT NULL UNIQUE,
  p256dh VARCHAR(200) NOT NULL,
  auth VARCHAR(200) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice en endpoint para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_suscripciones_endpoint ON suscripciones(endpoint);
