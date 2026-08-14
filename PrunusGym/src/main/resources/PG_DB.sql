-- ============================================================
-- SCRIPT DE INICIALIZACIÓN: PrunusGym Database
-- ============================================================

CREATE DATABASE IF NOT EXISTS `prunusgym`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `prunusgym`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. TABLA: usuarios
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` ENUM('ADMINISTRADOR','RECEPCIONISTA','CLIENTE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_usuario_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. TABLA: clientes
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT DEFAULT NULL,
  `nombre` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `documento` VARCHAR(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` VARCHAR(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uk_cliente_documento` (`documento`),
  UNIQUE KEY `uk_cliente_usuario` (`id_usuario`),
  KEY `idx_cliente_nombre_apellido` (`nombre`, `apellido`),
  CONSTRAINT `fk_cliente_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. TABLA: planes
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `planes`;
CREATE TABLE `planes` (
  `id_plan` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `duracion_dias` INT NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_plan`),
  UNIQUE KEY `uk_plan_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. TABLA: membresias
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `membresias`;
CREATE TABLE `membresias` (
  `id_membresia` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `id_plan` INT NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NOT NULL,
  `estado` ENUM('ACTIVA','INACTIVA','CANCELADA','EXPIRADA','RENOVADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVA',
  PRIMARY KEY (`id_membresia`),
  KEY `fk_membresia_cliente` (`id_cliente`),
  KEY `fk_membresia_plan` (`id_plan`),
  CONSTRAINT `fk_membresia_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `fk_membresia_plan` FOREIGN KEY (`id_plan`) REFERENCES `planes` (`id_plan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. TABLA: pagos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `pagos`;
CREATE TABLE `pagos` (
  `id_pago` INT NOT NULL AUTO_INCREMENT,
  `id_membresia` INT NOT NULL,
  `monto` DECIMAL(10,2) NOT NULL,
  `metodo_pago` ENUM('EFECTIVO','TARJETA','TRANSFERENCIA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` ENUM('PENDIENTE','COMPLETADO','FALLIDO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `referencia` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_pago` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago`),
  KEY `fk_pago_membresia` (`id_membresia`),
  CONSTRAINT `fk_pago_membresia` FOREIGN KEY (`id_membresia`) REFERENCES `membresias` (`id_membresia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. TABLA: asistencias
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `asistencias`;
CREATE TABLE `asistencias` (
  `id_asistencia` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `fecha_hora` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asistencia`),
  KEY `fk_asistencia_cliente` (`id_cliente`),
  CONSTRAINT `fk_asistencia_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- CARGA DE DATOS INICIALES (SEMILLA)
-- ============================================================

-- 1. Usuarios: 1 Admin, 1 Recepcionista, 3 Clientes
INSERT INTO `usuarios` (`id_usuario`, `email`, `password`, `rol`, `activo`) VALUES
(1, 'admin@prunusgym.com', '$2b$10$Zd9xuODNuqk/YfsBJE9D4uZmPuplUKcX/s.MQBywmIH9GgZYH1jZK', 'ADMINISTRADOR', 1),
(2, 'recepcion@prunusgym.com', '$2b$10$sH7mawY3mCdMwPkVnGGVROhmLrTECvWQWEoR.upElhMCFYZji54L.', 'RECEPCIONISTA', 1),
(3, 'carlos.perez@email.com', '$2a$10$kI.QuRSE5PnJZ8jDxoKhfuSdujodkjMpVwBsLUBeqkSQLDnmKd8Pe', 'CLIENTE', 1),
(4, 'ana.gomez@email.com', '$2a$10$CcpGMhqX2CGaNLJ5pR5xKu.wFjr6KnClIN0lR01jFCCE6xGYU0mfm', 'CLIENTE', 1),
(5, 'luis.martinez@email.com', '$2a$10$sWPL9beCTi8EdgSmgYgFz.nkbj79UmWVd8ktEe/NQmbzIl5CO15gG', 'CLIENTE', 1);

-- 2. Clientes: Vinculados 1:1 con sus usuarios
INSERT INTO `clientes` (`id_cliente`, `id_usuario`, `nombre`, `apellido`, `documento`, `telefono`, `activo`) VALUES
(1, 3, 'Carlos', 'Pérez', '001-1234567-8', '809-555-0001', 1),
(2, 4, 'Ana', 'Gómez', '001-8765432-1', '809-555-0002', 1),
(3, 5, 'Luis Alberto', 'Martínez', '001-5556677-9', '809-555-9999', 1);

-- 3. Planes
INSERT INTO `planes` (`id_plan`, `nombre`, `precio`, `duracion_dias`, `activo`) VALUES
(1, 'Mensual Básico', 1500.00, 30, 1),
(2, 'Trimestral VIP', 4000.00, 90, 1),
(3, 'Pase Diario', 200.00, 1, 1),
(4, 'Semanal', 500.00, 7, 1);

-- 4. Membresías (Asignadas a los 3 clientes)
INSERT INTO `membresias` (`id_membresia`, `id_cliente`, `id_plan`, `fecha_inicio`, `fecha_fin`, `estado`) VALUES
(1, 1, 2, '2026-08-01', '2026-10-30', 'ACTIVA'),
(2, 2, 1, '2026-08-01', '2026-08-31', 'ACTIVA'),
(3, 3, 4, '2026-08-10', '2026-08-17', 'ACTIVA');

-- 5. Pagos (Correspondientes a las membresías creadas)
INSERT INTO `pagos` (`id_pago`, `id_membresia`, `monto`, `metodo_pago`, `estado`, `referencia`, `fecha_pago`) VALUES
(1, 1, 4000.00, 'TRANSFERENCIA', 'COMPLETADO', 'BPD-99887766', '2026-08-01 10:00:00'),
(2, 2, 1500.00, 'EFECTIVO', 'COMPLETADO', NULL, '2026-08-01 11:30:00'),
(3, 3, 500.00, 'TARJETA', 'COMPLETADO', 'AUTH-882190', '2026-08-10 14:15:00');

-- 6. Asistencias (Asociadas a los clientes)
INSERT INTO `asistencias` (`id_asistencia`, `id_cliente`, `fecha_hora`) VALUES
(1, 1, '2026-08-02 08:30:00'),
(2, 1, '2026-08-05 09:00:00'),
(3, 2, '2026-08-03 17:00:00'),
(4, 3, '2026-08-11 18:20:00');
