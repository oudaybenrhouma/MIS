CREATE TABLE IF NOT EXISTS mis_product_offers (
  product_id text PRIMARY KEY,
  retail_enabled boolean NOT NULL DEFAULT false,
  price numeric(14, 3),
  currency text NOT NULL DEFAULT 'LYD'
    CHECK (currency IN ('LYD', 'USD', 'EUR')),
  quantity_available integer,
  sales_unit text,
  minimum_order_quantity integer NOT NULL DEFAULT 1
    CHECK (minimum_order_quantity > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (price IS NULL OR price > 0),
  CHECK (quantity_available IS NULL OR quantity_available >= 0),
  CHECK (NOT retail_enabled OR (price IS NOT NULL AND quantity_available IS NOT NULL AND sales_unit IS NOT NULL AND length(trim(sales_unit)) > 0))
);

CREATE INDEX IF NOT EXISTS mis_product_offers_retail_enabled_idx
  ON mis_product_offers (retail_enabled)
  WHERE retail_enabled = true;
