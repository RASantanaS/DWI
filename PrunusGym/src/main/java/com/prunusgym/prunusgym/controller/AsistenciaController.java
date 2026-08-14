package com.prunusgym.prunusgym.controller;

import com.prunusgym.prunusgym.dto.AsistenciaRequestDTO;
import com.prunusgym.prunusgym.entity.Asistencia;
import com.prunusgym.prunusgym.service.AsistenciaService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Asistencia> listarAsistencias() {
        return asistenciaService.obtenerTodasLasAsistencias();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public Asistencia obtenerAsistencia(@PathVariable Integer id) {
        return asistenciaService.obtenerAsistenciaPorId(id);
    }

    @GetMapping("/cliente/{idCliente}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Asistencia> obtenerAsistenciasPorCliente(@PathVariable Integer idCliente) {
        return asistenciaService.obtenerAsistenciasPorCliente(idCliente);
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Asistencia> buscarAsistencias(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        return asistenciaService.buscarAsistencias(fechaInicio, fechaFin);
    }

    /**
     * Autoservicio: asistencias del Cliente autenticado.
     */
    @GetMapping("/mias")
    public List<Asistencia> obtenerMisAsistencias(Authentication authentication) {
        return asistenciaService.obtenerAsistenciasPropias(authentication.getName());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<Asistencia> registrarAsistencia(@RequestBody AsistenciaRequestDTO dto) {
        Asistencia asistenciaCreada = asistenciaService.registrarAsistencia(dto);
        return new ResponseEntity<>(asistenciaCreada, HttpStatus.CREATED);
    }
}
