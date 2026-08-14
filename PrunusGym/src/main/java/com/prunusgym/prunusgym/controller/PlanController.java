package com.prunusgym.prunusgym.controller;

import com.prunusgym.prunusgym.dto.PlanRequestDTO;
import com.prunusgym.prunusgym.entity.Plan;
import com.prunusgym.prunusgym.service.PlanService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/planes")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    // Consulta del catálogo: abierta a cualquier rol autenticado (incluye CLIENTE),
    // ya que un Cliente debe poder ver qué planes existen para adquirir/renovar.
    @GetMapping
    public List<Plan> listarPlanes() {
        return planService.obtenerTodosLosPlanes();
    }

    @GetMapping("/activos")
    public List<Plan> listarPlanesActivos() {
        return planService.obtenerPlanesActivos();
    }

    @GetMapping("/inactivos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<Plan> listarPlanesInactivos() {
        return planService.obtenerPlanesInactivos();
    }

    @GetMapping("/{id}")
    public Plan obtenerPlan(@PathVariable Integer id) {
        return planService.obtenerPlanPorId(id);
    }

    @GetMapping("/activos/{id}")
    public Plan obtenerPlanActivoPorId(@PathVariable Integer id) {
        return planService.obtenerPlanActivoPorId(id);
    }

    @GetMapping("/inactivos/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Plan obtenerPlanInactivoPorId(@PathVariable Integer id) {
        return planService.obtenerPlanInactivoPorId(id);
    }

    // Escritura: exclusiva de Administrador, sin cambios respecto al diseño original.
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Plan> crearPlan(@RequestBody PlanRequestDTO dto) {
        Plan planCreado = planService.crearPlan(dto);
        return new ResponseEntity<>(planCreado, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Plan> actualizarPlan(@PathVariable Integer id, @RequestBody PlanRequestDTO dto) {
        Plan planActualizado = planService.actualizarPlan(id, dto);
        return new ResponseEntity<>(planActualizado, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> desactivarPlan(@PathVariable Integer id) {
        planService.desactivarPlan(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}/reactivar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> reactivarPlan(@PathVariable Integer id) {
        planService.reactivarPlan(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
