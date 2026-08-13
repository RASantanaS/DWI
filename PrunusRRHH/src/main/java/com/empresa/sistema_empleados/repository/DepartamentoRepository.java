package com.empresa.sistema_empleados.repository;

import com.empresa.sistema_empleados.entity.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository<Departamento, Long> nos da gratis los metodos CRUD basicos:
// findAll(), findById(), save(), deleteById(), etc.
// Spring Data JPA genera la implementacion automaticamente en tiempo de ejecucion,
// no necesitamos escribir ninguna clase que implemente esta interfaz.
public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {
}
