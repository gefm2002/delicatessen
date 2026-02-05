-- Add promotional pricing and flags to products
ALTER TABLE delicatessen_products
ADD COLUMN IF NOT EXISTS promo_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS promo_discount_type TEXT CHECK (promo_discount_type IN ('fixed', 'percentage', NULL)),
ADD COLUMN IF NOT EXISTS promo_discount_value DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT false;

-- Update existing is_featured to be consistent
COMMENT ON COLUMN delicatessen_products.is_featured IS 'Producto destacado en home';
COMMENT ON COLUMN delicatessen_products.is_promo IS 'Producto en promoción';
COMMENT ON COLUMN delicatessen_products.is_offer IS 'Producto en oferta especial';
COMMENT ON COLUMN delicatessen_products.promo_price IS 'Precio promocional final (si se establece, se usa este)';
COMMENT ON COLUMN delicatessen_products.promo_discount_type IS 'Tipo de descuento: fixed (monto fijo) o percentage (porcentaje)';
COMMENT ON COLUMN delicatessen_products.promo_discount_value IS 'Valor del descuento (monto o porcentaje según tipo)';
