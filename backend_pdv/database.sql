-- Table for users

-- Table for roles
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    user_id INT ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP  
);


CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES role(id)
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password text NOT NULL,
    user_id INT ,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP 
);
-- Table for categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP 
);

-- Table for deposits
CREATE TABLE deposits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP 
);

-- Table for products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL,
    image VARCHAR(255),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP 

);

-- Table for suppliers
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP 
);

-- Table for currencies
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP 
);

    -- Table for products_purchases
CREATE TABLE products_purchases (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    deposit_id INTEGER NOT NULL REFERENCES deposits(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    currency_id INTEGER NOT NULL REFERENCES currencies(id),
    exchange_rate DECIMAL(10, 4) NOT NULL
);

-- Table for detail_purchases
CREATE TABLE detail_purchases (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    purchase_id INTEGER NOT NULL REFERENCES products_purchases(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Table for cash_outflows
CREATE TABLE cash_outflows (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    date DATE NOT NULL,
    observation TEXT,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    deleted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Permisos para el módulo CashOutflow (Salida de Efectivo)
INSERT INTO permissions (name, description, module)
VALUES
    ('CashOutflow.active',  'Listar salidas de efectivo activos',   'Salidas de Efectivo'),
    ('CashOutflow.all',     'Ver todas las salidas de efectivo',    'Salidas de Efectivo'),
    ('CashOutflow.read',    'Ver salida de efectivo',               'Salidas de Efectivo'),
    ('CashOutflow.create',  'Crear salida de efectivo',             'Salidas de Efectivo'),
    ('CashOutflow.update',  'Actualizar salida de efectivo',        'Salidas de Efectivo'),
    ('CashOutflow.delete',  'Eliminar salida de efectivo',          'Salidas de Efectivo')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE products
    ALTER COLUMN image TYPE TEXT;

-- Table for cash_inflows
CREATE TABLE cash_inflows (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    date DATE NOT NULL,
    observation TEXT,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    deleted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Permisos para el módulo CashInflow (Entrada de Efectivo)
INSERT INTO permissions (name, description, module)
VALUES
    ('CashInflow.active',  'Listar entradas de efectivo activos',   'Entradas de Efectivo'),
    ('CashInflow.all',     'Ver todas las entradas de efectivo',    'Entradas de Efectivo'),
    ('CashInflow.read',    'Ver entrada de efectivo',               'Entradas de Efectivo'),
    ('CashInflow.create',  'Crear entrada de efectivo',             'Entradas de Efectivo'),
    ('CashInflow.update',  'Actualizar entrada de efectivo',        'Entradas de Efectivo'),
    ('CashInflow.delete',  'Eliminar entrada de efectivo',          'Entradas de Efectivo')
ON CONFLICT (name) DO NOTHING;

-- Table for app_config
CREATE TABLE app_config (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100),
    value TEXT,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    deleted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Insert default configuration
ALTER TABLE app_config
    ADD COLUMN IF NOT EXISTS key_name VARCHAR(100);

ALTER TABLE app_config
    ADD COLUMN IF NOT EXISTS value TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_config_key_name_active
    ON app_config (key_name)
    WHERE deleted_at IS NULL AND key_name IS NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'app_config' AND column_name = 'app_name'
    ) THEN
        INSERT INTO app_config (key_name, value, created_at)
        SELECT 'appName', COALESCE(app_name, 'Punto de Venta'), NOW()
        FROM app_config
        WHERE COALESCE(app_name, '') <> ''
        ON CONFLICT DO NOTHING;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'app_config' AND column_name = 'logo_url'
    ) THEN
        INSERT INTO app_config (key_name, value, created_at)
        SELECT 'logoUrl', COALESCE(logo_url, ''), NOW()
        FROM app_config
        ON CONFLICT DO NOTHING;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'app_config' AND column_name = 'favicon_url'
    ) THEN
        INSERT INTO app_config (key_name, value, created_at)
        SELECT 'faviconUrl', COALESCE(favicon_url, ''), NOW()
        FROM app_config
        ON CONFLICT DO NOTHING;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'app_config' AND column_name = 'pos_default_users'
    ) THEN
        INSERT INTO app_config (key_name, value, created_at)
        SELECT 'posDefaultUsers', COALESCE(pos_default_users, ''), NOW()
        FROM app_config
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

INSERT INTO app_config (key_name, value)
VALUES
    ('appName', 'Punto de Venta'),
    ('logoUrl', ''),
    ('faviconUrl', ''),
    ('posDefaultUsers', '')
ON CONFLICT (key_name) DO NOTHING;

-- Permisos para el módulo AppConfig (Configuración de la Aplicación)
INSERT INTO permissions (name, description, module)
VALUES
    ('AppConfig.active',  'Listar configuraciones activas',       'Configuración'),
    ('AppConfig.all',     'Ver todas las configuraciones',       'Configuración'),
    ('AppConfig.read',    'Ver configuración',                   'Configuración'),
    ('AppConfig.create',  'Crear configuración',                 'Configuración'),
    ('AppConfig.update',  'Actualizar configuración',            'Configuración'),
    ('AppConfig.delete',  'Eliminar configuración',              'Configuración')
ON CONFLICT (name) DO NOTHING;
