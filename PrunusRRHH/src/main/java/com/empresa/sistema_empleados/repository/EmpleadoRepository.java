package com.empresa.sistema_empleados.repository;

import com.empresa.sistema_empleados.entity.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
}
