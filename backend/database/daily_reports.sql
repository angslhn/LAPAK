CREATE TABLE IF NOT EXISTS daily_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_expense DECIMAL(15, 2) NOT NULL DEFAULT 0,
  transaction_count INT NOT NULL DEFAULT 0,
  net_profit DECIMAL(15, 2) NOT NULL DEFAULT 0,
  opening_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  closed_by INT DEFAULT NULL,
  closed_at DATETIME DEFAULT NULL,

  FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL
);