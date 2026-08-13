package com.empresa.sistema_inventario.repository;

import com.empresa.sistema_inventario.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
