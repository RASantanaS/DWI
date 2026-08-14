package com.prunusgym.prunusgym.repository;

import com.prunusgym.prunusgym.entity.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Integer> {

    List<Asistencia> findByCliente_IdCliente(Integer idCliente);

    long countByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Asistencia> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
}
