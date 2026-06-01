CREATE TABLE IF NOT EXISTS stock_mutations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  type ENUM('in', 'out') NOT NULL,
  source ENUM('purchase', 'transaction', 'adjustment') NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  stock_before INT UNSIGNED NOT NULL DEFAULT 0,
  stock_after INT UNSIGNED NOT NULL DEFAULT 0,
  reference_id INT DEFAULT NULL,
  note TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
)