CREATE TABLE IF NOT EXISTS cash_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category ENUM('sale', 'purchase', 'operational', 'credit_payment') NOT NULL,
  note TEXT DEFAULT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  reference_id INT DEFAULT NULL,
  reference_type ENUM('transaction', 'purchase', 'manual') NOT NULL DEFAULT 'manual',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);