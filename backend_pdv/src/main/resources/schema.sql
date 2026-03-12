CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS users (
	id bigserial NOT NULL,
	username varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	role_id int8 NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp NULL,
	created_id int4 NULL,
	is_enabled bool NULL,
	deleted_at timestamp(6) NULL,
	created_by int8 NULL,
	deleted_id int8 NULL,
	updated_by int8 NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_username_key UNIQUE (username),
	CONSTRAINT fkci7xr690rvyv3bnfappbyh8x0 FOREIGN KEY (updated_by) REFERENCES public.users(id),
	CONSTRAINT fkibk1e3kaxy5sfyeekp8hbhnim FOREIGN KEY (created_by) REFERENCES public.users(id),
	CONSTRAINT fkopmdrpym60rfbpjdfnjpi5av6 FOREIGN KEY (deleted_id) REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS roles (
	id SERIAL,
	"name" varchar(255) NOT NULL,
	description text NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp NULL,
	deleted_at timestamp(6) NULL,
	created_by int8 NULL,
	deleted_id int8 NULL,
	updated_by int8 NULL,
	CONSTRAINT role_name_key UNIQUE (name),
	CONSTRAINT role_pkey PRIMARY KEY (id),
    CONSTRAINT role_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id),
    CONSTRAINT role_deleted_id_fkey FOREIGN KEY (deleted_id) REFERENCES public.users(id),
    CONSTRAINT role_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    permission_id INTEGER NOT NULL REFERENCES permissions(id),
    CONSTRAINT role_permissions_unique UNIQUE (role_id, permission_id)
);

-- Create index for product code
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_code ON products(code) WHERE deleted_at IS NULL;

-- Insert admin role
INSERT INTO roles (id, name, created_at) VALUES (1, 'Admin', NOW()) ON CONFLICT (id) DO NOTHING;

-- Insert admin user
INSERT INTO public.users
(id, username, email, "password", role_id, created_at, updated_at, is_enabled, deleted_at, created_by, deleted_id, updated_by)VALUES
(1, 'Admin', 'admin@pdv.com', '$2a$10$RYkzfpuWEDYzLBdCaS6wLeg45Kp78uq6Eh8dty3W9Vx7ZM0eI/pxO', 1,  NOW(), NULL, true, NULL, 1, NULL, NULL) 
ON CONFLICT (id) DO NOTHING;


-- Product Permissions
INSERT INTO permissions (name, description, module) 
VALUES 
    ('Product.active', 'Listar productos activos', 'Productos'),
    ('Product.delete', 'Eliminar producto', 'Productos'),
    ('Product.create', 'Crear producto', 'Productos'),
    ('Product.update', 'Actualizar producto', 'Productos'),
    ('Product.all', 'Ver todos', 'Productos'),
    ('Product.read', 'Ver producto', 'Productos')
ON CONFLICT (name) DO NOTHING;

-- Supplier Permissions
INSERT INTO permissions (name, description, module) 
VALUES 
    ('Supplier.active', 'Listar proveedores activos', 'Proveedores'),
    ('Supplier.delete', 'Eliminar proveedor', 'Proveedores'),
    ('Supplier.create', 'Crear proveedor', 'Proveedores'),
    ('Supplier.update', 'Actualizar proveedor', 'Proveedores'),
    ('Supplier.all', 'Ver todos', 'Proveedores'),
    ('Supplier.read', 'Ver proveedor', 'Proveedores')
ON CONFLICT (name) DO NOTHING;

-- Role Permissions
INSERT INTO permissions (name, description, module) 
VALUES 
    ('Role.active', 'Listar roles activos', 'Roles'),
    ('Role.delete', 'Eliminar rol', 'Roles'),
    ('Role.create', 'Crear rol', 'Roles'),
    ('Role.update', 'Actualizar rol', 'Roles'),
    ('Role.all', 'Ver todos', 'Roles'),
    ('Role.read', 'Ver rol', 'Roles')
ON CONFLICT (name) DO NOTHING;

-- User Permissions
INSERT INTO permissions (name, description, module) 
VALUES 
    ('User.active', 'Listar usuarios activos', 'Usuarios'),
    ('User.delete', 'Eliminar usuario', 'Usuarios'),
    ('User.create', 'Crear usuario', 'Usuarios'),
    ('User.update', 'Actualizar usuario', 'Usuarios'),
    ('User.all', 'Ver todos', 'Usuarios'),
    ('User.read', 'Ver usuario', 'Usuarios')
ON CONFLICT (name) DO NOTHING;

-- Client Permissions
INSERT INTO permissions (name, description, module) 
VALUES 
    ('Client.active', 'Listar clientes activos', 'Clientes'),
    ('Client.delete', 'Eliminar cliente', 'Clientes'),
    ('Client.create', 'Crear cliente', 'Clientes'),
    ('Client.update', 'Actualizar cliente', 'Clientes'),
    ('Client.all', 'Ver todos', 'Clientes'),
    ('Client.read', 'Ver cliente', 'Clientes')
ON CONFLICT (name) DO NOTHING;

-- Category Permissions
INSERT INTO permissions (name, description, module) 
VALUES 
    ('Category.active', 'Listar categorías activas', 'Categorias'),
    ('Category.delete', 'Eliminar categoría', 'Categorias'),
    ('Category.create', 'Crear categoría', 'Categorias'),
    ('Category.update', 'Actualizar categoría', 'Categorias'),
    ('Category.all', 'Ver todos', 'Categorias'),
    ('Category.read', 'Ver categoría', 'Categorias')
ON CONFLICT (name) DO NOTHING;

-- ProductSale Permissions
INSERT INTO permissions (name, description, module) 
VALUES 
    ('ProductSale.active', 'Listar ventas activas de productos', 'Venta de Productos'),
    ('ProductSale.delete', 'Eliminar venta de producto', 'Venta de Productos'),
    ('ProductSale.create', 'Crear venta de producto', 'Venta de Productos'),
    ('ProductSale.update', 'Actualizar venta de producto', 'Venta de Productos'),
    ('ProductSale.all', 'Ver todos de productos', 'Venta de Productos'),
    ('ProductSale.read', 'Ver venta de producto', 'Venta de Productos')
ON CONFLICT (name) DO NOTHING;

-- ProductPurchase Permissions
INSERT INTO permissions (name, description, module) 
VALUES 
    ('ProductPurchase.active', 'Listar compras activas de productos', 'Compra de Productos'),
    ('ProductPurchase.delete', 'Eliminar compra de producto', 'Compra de Productos'),
    ('ProductPurchase.create', 'Crear compra de producto', 'Compra de Productos'),
    ('ProductPurchase.update', 'Actualizar compra de producto', 'Compra de Productos'),
    ('ProductPurchase.all', 'Ver todos de productos', 'Compra de Productos'),
    ('ProductPurchase.read', 'Ver compra de producto', 'Compra de Productos')
ON CONFLICT (name) DO NOTHING;


-- Add all permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r
JOIN permissions p ON true
WHERE r.name = 'Admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Function to calculate product stock
CREATE OR REPLACE FUNCTION public.calculate_product_stock(p_product_id integer)
 RETURNS double precision
 LANGUAGE plpgsql
AS $function$
DECLARE
    purchase_quantity DOUBLE PRECISION;
    sales_quantity DOUBLE PRECISION;
    stock DOUBLE PRECISION;
BEGIN
    -- Sumar todas las cantidades compradas que no estén eliminadas
    SELECT COALESCE(SUM(pi.quantity), 0)::DOUBLE PRECISION
    INTO purchase_quantity
    FROM purchase_items pi
    JOIN products_purchases pp ON pi.purchase_id = pp.id
    WHERE pi.product_id = p_product_id
      AND pp.deleted_at IS NULL;

    -- Sumar todas las cantidades vendidas que no estén eliminadas
    SELECT COALESCE(SUM(si.quantity), 0)::DOUBLE PRECISION
    INTO sales_quantity
    FROM sale_items si
    JOIN products_sales ps ON si.sale_id = ps.id
    WHERE si.product_id = p_product_id
      AND ps.deleted_at IS NULL;

    -- Calcular el stock final
    stock := purchase_quantity - sales_quantity;

    RETURN stock;
END;
$function$
;

-- Function to calculate product stock
CREATE OR REPLACE FUNCTION public.calculate_product_stock(p_product_id bigint)
 RETURNS double precision
 LANGUAGE plpgsql
AS $function$
DECLARE
    purchase_quantity DOUBLE PRECISION;
    sales_quantity DOUBLE PRECISION;
    stock DOUBLE PRECISION;
BEGIN
    -- Sumar todas las cantidades compradas que no estén eliminadas
    SELECT COALESCE(SUM(pi.quantity), 0)::DOUBLE PRECISION
    INTO purchase_quantity
    FROM purchase_items pi
    JOIN products_purchases pp ON pi.purchase_id = pp.id
    WHERE pi.product_id = p_product_id
      AND pp.deleted_at IS NULL;

    -- Sumar todas las cantidades vendidas que no estén eliminadas
    SELECT COALESCE(SUM(si.quantity), 0)::DOUBLE PRECISION
    INTO sales_quantity
    FROM sale_items si
    JOIN products_sales ps ON si.sale_id = ps.id
    WHERE si.product_id = p_product_id
      AND ps.deleted_at IS NULL;

    -- Calcular el stock final
    stock := purchase_quantity - sales_quantity;

    RETURN stock;
END;
$function$
;

-- Function to update stock after delete
CREATE OR REPLACE FUNCTION public.update_stock_after_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    sale_item RECORD;
    new_stock DOUBLE PRECISION;
BEGIN
    -- Iterar solo sobre los items de la venta eliminada
    -- cuyos productos tienen stock_control = TRUE
    FOR sale_item IN
        SELECT si.*
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = OLD.id
        AND p.stock_control = TRUE
    LOOP
        -- Llamar a la función para calcular el stock del producto
        new_stock := calculate_product_stock(sale_item.product_id);

        -- Verificar si el stock calculado es negativo
        IF new_stock < 0 THEN
            RAISE EXCEPTION 'Stock negativo para el producto ID %', sale_item.product_id;
        END IF;

        -- Actualizar el stock en la tabla products
        UPDATE products
        SET stock = new_stock
        WHERE id = sale_item.product_id;
    END LOOP;

    RETURN OLD;
END;
$function$
;

-- Function to update stock after delete
CREATE OR REPLACE FUNCTION public.update_stock_after_delete_purchase()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    purchase_item RECORD;
    new_stock DOUBLE PRECISION;
BEGIN
    -- Iterar solo sobre los items de la compra eliminada
    -- cuyos productos tienen stock_control = TRUE
    FOR purchase_item IN
        SELECT pi.*
        FROM purchase_items pi
        JOIN products p ON pi.product_id = p.id
        WHERE pi.purchase_id = OLD.id
        AND p.stock_control = TRUE
    LOOP
        -- Llamar a la función para calcular el stock del producto, restando la cantidad comprada
        new_stock := calculate_product_stock(purchase_item.product_id);

        -- Verificar si el stock calculado es negativo
        IF new_stock < 0 THEN
           RAISE EXCEPTION 'Stock negativo para el producto ID %', purchase_item.product_id;
        END IF;

        -- Actualizar el stock en la tabla products
        UPDATE products
        SET stock = new_stock
        WHERE id = purchase_item.product_id;
    END LOOP;

    RETURN OLD;
END;
$function$
;

-- Function to update stock after purchase
CREATE OR REPLACE FUNCTION public.update_stock_after_purchase()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_stock DOUBLE PRECISION;
BEGIN
    -- Verificar si el producto tiene stock_control = TRUE
    IF (SELECT stock_control FROM products WHERE id = NEW.product_id) THEN
        -- Recalcular el stock actual llamando a calculate_product_stock
        new_stock := calculate_product_stock(NEW.product_id);

        IF new_stock < 0 THEN
            RAISE EXCEPTION 'Stock negativo para el producto ID %', NEW.product_id;
        END IF;

        -- Actualizar el stock del producto en la tabla products
        UPDATE products
        SET stock = new_stock
        WHERE id = NEW.product_id;
    END IF;

    RETURN NEW;
END;
$function$
;

-- Trigger to update stock after delete
create trigger trg_update_stock_after_pp
after
update of deleted_at on public.products_purchases for each row when (
    (
        old.deleted_at is distinct from new.deleted_at
    )
)
execute function update_stock_after_delete_purchase ()


-- Trigger to update stock after delete
create trigger trg_update_stock_after_ps
after
update of deleted_at on public.products_sales for each row
execute function update_stock_after_delete ()


-- Trigger to update stock after purchase
create trigger trg_update_stock_after_purchase
after insert
or delete
or
update on public.purchase_items for each row
execute function update_stock_after_purchase ()


-- Trigger to update stock after sale
create trigger trg_update_stock_after_sale
after insert
or delete
or
update on public.sale_items for each row
execute function update_stock_after_purchase ()


CREATE OR REPLACE FUNCTION public.verify_stock_control()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN

    IF NEW.stock_control is FALSE THEN
        NEW.stock := 0; 
	else 
		NEW.stock := calculate_product_stock(new.id);
    END IF;


    RETURN NEW;
		
END;
$function$
;


create trigger trg_verify_stock_control before
insert
    or
update
    on
    public.products for each row execute function verify_stock_control()


-- DROP FUNCTION public.generate_unique_barcode();

CREATE OR REPLACE FUNCTION public.generate_unique_barcode()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  generated_barcode TEXT;
BEGIN 
  -- Verifica si el código de barras proporcionado es nulo o vacío
  IF NEW.code IS NULL OR LENGTH(NEW.code) = 0 THEN
    -- Generar un nuevo código de barras único
    LOOP
      generated_barcode := LPAD(FLOOR(RANDOM() * 100000000000)::TEXT, 12, '0'); -- Genera un código de 12 dígitos
      -- Verifica la unicidad del código de barras generado
      EXIT WHEN NOT EXISTS (SELECT 1 FROM products WHERE code = generated_barcode);
    END LOOP;

    -- Asignar el código generado al producto
    NEW.code := generated_barcode;
  END IF;

  RETURN NEW;
END;
$function$
;



create trigger adjust_or_generate_barcode before
insert
    or
update
    on
    public.products for each row execute function generate_unique_barcode()