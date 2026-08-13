package com.empresa.sistema_inventario.repository;

import com.empresa.sistema_inventario.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
