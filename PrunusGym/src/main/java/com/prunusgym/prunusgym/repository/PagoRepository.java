package com.prunusgym.prunusgym.repository;

import com.prunusgym.prunusgym.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Integer> {

    List<Pago> findByEstadoAndFechaPagoBetween(
            com.prunusgym.prunusgym.entity.EstadoPago estado,
            LocalDateTime inicio,
            LocalDateTime fin
    );

    List<Pago> findByMembresia_IdMembresia(Integer idMembresia);

    List<Pago> findByFechaPagoBetween(LocalDateTime inicio, LocalDateTime fin);
}
