package com.prunusgym.prunusgym.repository;

import com.prunusgym.prunusgym.entity.Membresia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MembresiaRepository extends JpaRepository<Membresia, Integer> {

    List<Membresia> findByCliente_IdCliente(Integer idCliente);

    List<Membresia> findByPlan_IdPlan(Integer idPlan);

    List<Membresia> findByFechaFinBetween(LocalDate inicio, LocalDate fin);
}
