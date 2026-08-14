package com.prunusgym.prunusgym.service;

import com.prunusgym.prunusgym.dto.PlanRequestDTO;
import com.prunusgym.prunusgym.entity.Plan;
import com.prunusgym.prunusgym.exception.RecursoDuplicadoException;
import com.prunusgym.prunusgym.exception.RecursoNoEncontradoException;
import com.prunusgym.prunusgym.repository.PlanRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public List<Plan> obtenerTodosLosPlanes() {
        return planRepository.findAll();
    }

    public List<Plan> obtenerPlanesActivos() {
        return planRepository.findByActivoTrue();
    }

    public List<Plan> obtenerPlanesInactivos() {
        return planRepository.findByActivoFalse();
    }

    public Plan obtenerPlanPorId(Integer id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado con id: " + id));
    }

    public Plan obtenerPlanActivoPorId(Integer id) {
        return planRepository.findByIdPlanAndActivoTrue(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan activo no encontrado con id: " + id));
    }

    public Plan obtenerPlanInactivoPorId(Integer id) {
        return planRepository.findByIdPlanAndActivoFalse(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan inactivo no encontrado con id: " + id));
    }

    public Plan crearPlan(PlanRequestDTO dto) {
        validarDatos(dto);

        if (planRepository.existsByNombre(dto.getNombre())) {
            throw new RecursoDuplicadoException("Ya existe un plan con el nombre: " + dto.getNombre());
        }

        Plan plan = new Plan();
        plan.setNombre(dto.getNombre());
        plan.setPrecio(dto.getPrecio());
        plan.setDuracionDias(dto.getDuracionDias());
        plan.setActivo(true);

        return planRepository.save(plan);
    }

    public Plan actualizarPlan(Integer id, PlanRequestDTO dto) {
        Plan planExistente = planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado con id: " + id));

        validarDatos(dto);

        if (planRepository.existsByNombreAndIdPlanNot(dto.getNombre(), id)) {
            throw new RecursoDuplicadoException("Ya existe otro plan con el nombre: " + dto.getNombre());
        }

        planExistente.setNombre(dto.getNombre());
        planExistente.setPrecio(dto.getPrecio());
        planExistente.setDuracionDias(dto.getDuracionDias());

        return planRepository.save(planExistente);
    }

    public void desactivarPlan(Integer id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado con id: " + id));

        plan.setActivo(false);
        planRepository.save(plan);
    }

    public void reactivarPlan(Integer id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado con id: " + id));

        plan.setActivo(true);
        planRepository.save(plan);
    }

    private void validarDatos(PlanRequestDTO dto) {
        if (dto.getPrecio() == null || dto.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0.");
        }
        if (dto.getDuracionDias() == null || dto.getDuracionDias() <= 0) {
            throw new IllegalArgumentException("La duración en días debe ser mayor a 0.");
        }
    }
}