CREATE TABLE IF NOT EXISTS purchase_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  purchase_price DECIMAL(15, 2) NOT NULL,

  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);