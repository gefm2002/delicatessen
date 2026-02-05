-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE delicatessen_order_status AS ENUM ('new', 'contacted', 'confirmed', 'preparing', 'shipped', 'completed', 'canceled');
CREATE TYPE delicatessen_delivery_type AS ENUM ('pickup', 'delivery');
CREATE TYPE delicatessen_payment_method AS ENUM ('cash', 'transfer', 'mercadopago', 'cards', 'wallets_qr');

-- Categories
CREATE TABLE delicatessen_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE delicatessen_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES delicatessen_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('standard', 'weighted', 'combo', 'apparel', 'service')),
  price DECIMAL(10, 2),
  price_per_kg DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  has_stock BOOLEAN DEFAULT true,
  images JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  promo_badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promos
CREATE TABLE delicatessen_promos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  conditions TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches
CREATE TABLE delicatessen_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address_text TEXT NOT NULL,
  map_query TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  hours JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Config (singleton)
CREATE TABLE delicatessen_site_config (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  brand_name TEXT DEFAULT 'Delicatessen',
  brand_tagline TEXT,
  whatsapp_number TEXT,
  currency TEXT DEFAULT 'ARS',
  delivery_options JSONB DEFAULT '{}'::jsonb,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  theme JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT delicatessen_site_config_singleton CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Orders
CREATE TABLE delicatessen_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number INTEGER UNIQUE,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  payment_method delicatessen_payment_method NOT NULL,
  delivery_type delicatessen_delivery_type NOT NULL,
  delivery_address TEXT,
  delivery_zone TEXT,
  branch_id UUID REFERENCES delicatessen_branches(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  whatsapp_message TEXT,
  status delicatessen_order_status DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Events
CREATE TABLE delicatessen_order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES delicatessen_orders(id) ON DELETE CASCADE,
  status delicatessen_order_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Notes (internal)
CREATE TABLE delicatessen_order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES delicatessen_orders(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins
CREATE TABLE delicatessen_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence for order numbers
CREATE SEQUENCE delicatessen_order_number_seq START 1000;

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_delicatessen_categories_updated_at BEFORE UPDATE ON delicatessen_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delicatessen_products_updated_at BEFORE UPDATE ON delicatessen_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delicatessen_promos_updated_at BEFORE UPDATE ON delicatessen_promos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delicatessen_branches_updated_at BEFORE UPDATE ON delicatessen_branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delicatessen_site_config_updated_at BEFORE UPDATE ON delicatessen_site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delicatessen_orders_updated_at BEFORE UPDATE ON delicatessen_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE delicatessen_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE delicatessen_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delicatessen_promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE delicatessen_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE delicatessen_site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE delicatessen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delicatessen_order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE delicatessen_order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE delicatessen_admins ENABLE ROW LEVEL SECURITY;

-- Policies: Categories (SELECT anon for active)
CREATE POLICY "Categories are viewable by everyone for active" ON delicatessen_categories
  FOR SELECT USING (is_active = true);

-- Policies: Products (SELECT anon for active)
CREATE POLICY "Products are viewable by everyone for active" ON delicatessen_products
  FOR SELECT USING (is_active = true);

-- Policies: Promos (SELECT anon for active)
CREATE POLICY "Promos are viewable by everyone for active" ON delicatessen_promos
  FOR SELECT USING (is_active = true);

-- Policies: Branches (SELECT anon for active)
CREATE POLICY "Branches are viewable by everyone for active" ON delicatessen_branches
  FOR SELECT USING (is_active = true);

-- Policies: Site Config (SELECT anon)
CREATE POLICY "Site config is viewable by everyone" ON delicatessen_site_config
  FOR SELECT USING (true);

-- Policies: Orders (INSERT anon allowed, SELECT/UPDATE/DELETE denied)
CREATE POLICY "Orders can be inserted by anon" ON delicatessen_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders cannot be selected by anon" ON delicatessen_orders
  FOR SELECT USING (false);

CREATE POLICY "Orders cannot be updated by anon" ON delicatessen_orders
  FOR UPDATE USING (false);

CREATE POLICY "Orders cannot be deleted by anon" ON delicatessen_orders
  FOR DELETE USING (false);

-- Policies: Order Events (INSERT anon allowed, SELECT denied)
CREATE POLICY "Order events can be inserted by anon" ON delicatessen_order_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Order events cannot be selected by anon" ON delicatessen_order_events
  FOR SELECT USING (false);

-- Policies: Order Notes (no anon access)
CREATE POLICY "Order notes cannot be accessed by anon" ON delicatessen_order_notes
  FOR ALL USING (false);

-- Policies: Admins (no anon access)
CREATE POLICY "Admins cannot be accessed by anon" ON delicatessen_admins
  FOR ALL USING (false);

-- Indexes
CREATE INDEX idx_delicatessen_products_category_id ON delicatessen_products(category_id);
CREATE INDEX idx_delicatessen_products_slug ON delicatessen_products(slug);
CREATE INDEX idx_delicatessen_products_is_active ON delicatessen_products(is_active);
CREATE INDEX idx_delicatessen_products_is_featured ON delicatessen_products(is_featured);
CREATE INDEX idx_delicatessen_orders_order_number ON delicatessen_orders(order_number);
CREATE INDEX idx_delicatessen_orders_status ON delicatessen_orders(status);
CREATE INDEX idx_delicatessen_orders_created_at ON delicatessen_orders(created_at);
CREATE INDEX idx_delicatessen_order_events_order_id ON delicatessen_order_events(order_id);
CREATE INDEX idx_delicatessen_order_notes_order_id ON delicatessen_order_notes(order_id);
