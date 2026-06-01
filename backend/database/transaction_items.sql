CREATE TABLE IF NOT EXISTS transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  selling_price DECIMAL(15, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,

  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);