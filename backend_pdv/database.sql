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
