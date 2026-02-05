-- RPC function to insert order with event (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION delicatessen_insert_order(
  p_customer_first_name TEXT,
  p_customer_last_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_payment_method delicatessen_payment_method,
  p_delivery_type delicatessen_delivery_type,
  p_delivery_address TEXT,
  p_delivery_zone TEXT,
  p_branch_id UUID,
  p_items JSONB,
  p_subtotal DECIMAL(10, 2),
  p_total DECIMAL(10, 2),
  p_whatsapp_message TEXT,
  p_notes TEXT
)
RETURNS TABLE (
  id UUID,
  order_number INTEGER,
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  status delicatessen_order_status,
  total DECIMAL(10, 2),
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_order_number INTEGER;
BEGIN
  -- Get next order number
  v_order_number := nextval('delicatessen_order_number_seq');

  -- Insert order
  INSERT INTO delicatessen_orders (
    order_number,
    customer_first_name,
    customer_last_name,
    customer_email,
    customer_phone,
    payment_method,
    delivery_type,
    delivery_address,
    delivery_zone,
    branch_id,
    items,
    subtotal,
    total,
    whatsapp_message,
    notes,
    status
  ) VALUES (
    v_order_number,
    p_customer_first_name,
    p_customer_last_name,
    p_customer_email,
    p_customer_phone,
    p_payment_method,
    p_delivery_type,
    p_delivery_address,
    p_delivery_zone,
    p_branch_id,
    p_items,
    p_subtotal,
    p_total,
    p_whatsapp_message,
    p_notes,
    'new'
  )
  RETURNING delicatessen_orders.id INTO v_order_id;

  -- Insert initial event
  INSERT INTO delicatessen_order_events (order_id, status, notes)
  VALUES (v_order_id, 'new', 'Orden creada');

  -- Return order data
  RETURN QUERY
  SELECT
    o.id,
    o.order_number,
    o.customer_first_name,
    o.customer_last_name,
    o.customer_email,
    o.customer_phone,
    o.status,
    o.total,
    o.created_at
  FROM delicatessen_orders o
  WHERE o.id = v_order_id;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION delicatessen_insert_order TO anon;
GRANT EXECUTE ON FUNCTION delicatessen_insert_order TO authenticated;
