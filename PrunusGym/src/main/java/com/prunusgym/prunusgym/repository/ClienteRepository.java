package com.prunusgym.prunusgym.repository;

import com.prunusgym.prunusgym.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    List<Cliente> findByActivoTrue();

    List<Cliente> findByActivoFalse();

    Optional<Cliente> findByIdClienteAndActivoTrue(Integer idCliente);

    Optional<Cliente> findByIdClienteAndActivoFalse(Integer idCliente);

    Optional<Cliente> findByIdUsuario(Integer idUsuario);

    boolean existsByDocumento(String documento);

    boolean existsByDocumentoAndIdClienteNot(String documento, Integer idCliente);

    List<Cliente> findByNombreContainingIgnoreCase(String nombre);

    List<Cliente> findByDocumentoContaining(String documento);
}
