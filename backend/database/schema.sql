-- ============================================================
-- LAPAK Database Schema
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users (parent dari transactions, daily_reports)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) DEFAULT NULL,
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

-- 3. Suppliers (parent dari purchases & supplier_debts)
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
  address TEXT DEFAULT NULL,
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
-- ⚠️ HARUS SEBELUM supplier_debts!
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

-- 8. Tabel hutang dagang (supplier_debts)
CREATE TABLE IF NOT EXISTS supplier_debts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT DEFAULT NULL, -- NULL jika hutang manual
  supplier_id INT NOT NULL,
  receipt_number VARCHAR(50) DEFAULT NULL,
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  paid DECIMAL(15, 2) NOT NULL DEFAULT 0,
  remaining DECIMAL(15, 2) NOT NULL DEFAULT 0,
  note TEXT DEFAULT NULL,
  status ENUM('unpaid', 'partial', 'paid') NOT NULL DEFAULT 'unpaid',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

-- 9. Transactions (parent dari transaction_items)
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT DEFAULT NULL,
  user_id INT NOT NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  discount DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  paid DECIMAL(15, 2) DEFAULT 0,
  remaining DECIMAL(15, 2) NOT NULL DEFAULT 0,
  due_date DATE DEFAULT NULL,
  note TEXT DEFAULT NULL,
  payment_method ENUM('cash', 'qris', 'transfer', 'credit', 'debit') NOT NULL,
  status ENUM('paid', 'unpaid', 'cancelled') NOT NULL DEFAULT 'paid',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 10. Transaction_items (child dari transactions & products)
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

-- 11. Cash_ledger (tidak ada foreign key wajib)
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

-- 12. Stock_mutations (child dari products)
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

-- 13. Daily_reports (child dari users)
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

-- 14. Password_resets (tidak ada foreign key)
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expired_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- INDEXES (Setelah semua tabel dibuat)
-- ============================================================

-- Password Resets
CREATE INDEX idx_password_resets_email ON password_resets(email);
CREATE INDEX idx_password_resets_token ON password_resets(token);

-- Transactions
CREATE INDEX idx_transactions_date_status ON transactions(date, status);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_invoice_number ON transactions(invoice_number);
CREATE INDEX idx_transactions_customer_status ON transactions(customer_id, status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);

-- Transaction Items
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);

-- Products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);

-- Purchases
CREATE INDEX idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX idx_purchases_supplier_status ON purchases(supplier_id, status);
CREATE INDEX idx_purchases_date ON purchases(date);
CREATE INDEX idx_purchases_receipt_number ON purchases(receipt_number);
CREATE INDEX idx_purchases_status ON purchases(status);

-- Purchase Items
CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product ON purchase_items(product_id);

-- Stock Mutations
CREATE INDEX idx_stock_mutations_product ON stock_mutations(product_id);
CREATE INDEX idx_stock_mutations_created_at ON stock_mutations(created_at);
CREATE INDEX idx_stock_mutations_type ON stock_mutations(type);
CREATE INDEX idx_stock_mutations_source ON stock_mutations(source);

-- Cash Ledger
CREATE INDEX idx_cash_ledger_date_type ON cash_ledger(date, type);
CREATE INDEX idx_cash_ledger_reference ON cash_ledger(reference_id, reference_type);
CREATE INDEX idx_cash_ledger_category ON cash_ledger(category);
CREATE INDEX idx_cash_ledger_date ON cash_ledger(date);

-- Customers
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Suppliers
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_email ON suppliers(email);

-- Supplier Debts
CREATE INDEX idx_supplier_debts_supplier_id ON supplier_debts(supplier_id);
CREATE INDEX idx_supplier_debts_purchase_id ON supplier_debts(purchase_id);
CREATE INDEX idx_supplier_debts_due_date ON supplier_debts(due_date);
CREATE INDEX idx_supplier_debts_status ON supplier_debts(status);
CREATE INDEX idx_supplier_debts_supplier_status ON supplier_debts(supplier_id, status);
CREATE INDEX idx_supplier_debts_due_date_status ON supplier_debts(due_date, status);
CREATE INDEX idx_supplier_debts_date ON supplier_debts(date);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Daily Reports
CREATE INDEX idx_daily_reports_date ON daily_reports(date);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);