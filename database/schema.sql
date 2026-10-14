
CREATE DATABASE IF NOT EXISTS tienda_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tienda_db;

CREATE TABLE IF NOT EXISTS cliente (
  id_cliente INT          NOT NULL AUTO_INCREMENT,  
  nombre     VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  telefono   VARCHAR(20)  NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cliente),
  UNIQUE KEY uq_cliente_email (email)              
) ENGINE=InnoDB;
