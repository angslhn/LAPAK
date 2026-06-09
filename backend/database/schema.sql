-- ============================================================
-- LAPAK Database Schema
-- ============================================================

-- 1. Users (parent dari transactions, daily_reports)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  store_name VARCHAR(150) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  role ENUM('owner', 'cashier') NOT NULL DEFAULT 'owner',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories (parent dari products)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Suppliers (parent dari purchases)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL UNIQUE,
  contact_person VARCHAR(100) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  note TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Customers (parent dari transactions)
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Products (parent dari purchase_items, transaction_items, stock_mutations)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  sku VARCHAR(50) DEFAULT NULL UNIQUE,
  barcode VARCHAR(50) DEFAULT NULL UNIQUE,
  weight DECIMAL(10,3) DEFAULT NULL,
  name VARCHAR(150) NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  image_public_id VARCHAR(255) DEFAULT NULL,
  purchase_price DECIMAL(15, 2) NOT NULL,
  selling_price DECIMAL(15, 2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  minimum_stock INT UNSIGNED NOT NULL DEFAULT 0,
  unit ENUM('pcs', 'pack', 'bottle', 'kg') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 6. Purchases (parent dari purchase_items)
CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  date DATE NOT NULL,
  due_date DATE DEFAULT NULL,
  total DECIMAL(15, 2) NOT NULL,
  status ENUM('paid', 'unpaid') NOT NULL DEFAULT 'unpaid',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

-- 7. Purchase_items (child dari purchases & products)
CREATE TABLE IF NOT EXISTS purchase_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  purchase_price DECIMAL(15, 2) NOT NULL,

  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 8. Transactions (parent dari transaction_items)
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT DEFAULT NULL,
  user_id INT NOT NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  discount DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  due_date DATE DEFAULT NULL,
  note TEXT DEFAULT NULL,
  payment_method ENUM('cash', 'qris', 'transfer', 'credit', 'debit') NOT NULL,
  status ENUM('paid', 'unpaid', 'cancelled') NOT NULL DEFAULT 'paid',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 9. Transaction_items (child dari transactions & products)
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

-- 10. Cash_ledger (tidak ada foreign key wajib)
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

-- 11. Stock_mutations (child dari products)
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
);

-- 12. Daily_reports (child dari users)
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

-- 13. Password_resets (tidak ada foreign key)
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expired_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_token (token)
);