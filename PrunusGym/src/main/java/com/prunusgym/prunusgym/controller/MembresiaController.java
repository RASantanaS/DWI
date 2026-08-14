package com.prunusgym.prunusgym.controller;

import com.prunusgym.prunusgym.dto.MembresiaRequestDTO;
import com.prunusgym.prunusgym.entity.EstadoMembresia;
import com.prunusgym.prunusgym.entity.Membresia;
import com.prunusgym.prunusgym.service.MembresiaService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/membresias")
public class MembresiaController {

    private final MembresiaService membresiaService;

    public MembresiaController(MembresiaService membresiaService) {
        this.membresiaService = membresiaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Membresia> listarMembresias() {
        return membresiaService.obtenerTodasLasMembresias();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public Membresia obtenerMembresia(@PathVariable Integer id) {
        return membresiaService.obtenerMembresiaPorId(id);
    }

    @GetMapping("/cliente/{idCliente}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Membresia> obtenerMembresiasPorCliente(@PathVariable Integer idCliente) {
        return membresiaService.obtenerMembresiasPorCliente(idCliente);
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Membresia> buscarMembresias(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) String estado) {
        return membresiaService.buscarMembresias(fechaInicio, fechaFin, estado);
    }

    /**
     * Autoservicio: membresías del Cliente autenticado.
     */
    @GetMapping("/mias")
    public List<Membresia> obtenerMisMembresias(Authentication authentication) {
        return membresiaService.obtenerMembresiasPropias(authentication.getName());
    }

    /**
     * Abierto a cualquier rol autenticado: Admin/Recepcionista pueden crear para cualquier
     * cliente; un Cliente solo puede crear (adquirir/renovar) la suya propia -> validado
     * dentro del Service usando el JWT.
     */
    @PostMapping
    public ResponseEntity<Membresia> crearMembresia(@RequestBody MembresiaRequestDTO dto,
                                                      Authentication authentication) {
        Membresia membresiaCreada = membresiaService.crearMembresia(dto, authentication);
        return new ResponseEntity<>(membresiaCreada, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<Membresia> actualizarMembresia(@PathVariable Integer id, @RequestBody MembresiaRequestDTO dto) {
        Membresia membresiaActualizada = membresiaService.actualizarMembresia(id, dto);
        return new ResponseEntity<>(membresiaActualizada, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<Void> eliminarMembresia(@PathVariable Integer id) {
        membresiaService.eliminarMembresia(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<Membresia> cambiarEstado(@PathVariable Integer id, @RequestParam EstadoMembresia estado) {
        Membresia membresia = membresiaService.cambiarEstado(id, estado);
        return new ResponseEntity<>(membresia, HttpStatus.OK);
    }
}
