CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT DEFAULT NULL,
  user_id INT NOT NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(15, 2) NOT NULL,
  payment_method ENUM('cash', 'qris', 'transfer', 'credit', 'debit') NOT NULL,
  status ENUM('paid', 'unpaid', 'cancelled') NOT NULL DEFAULT 'paid',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);