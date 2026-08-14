package com.prunusgym.prunusgym.repository;

import com.prunusgym.prunusgym.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Integer> {

    List<Plan> findByActivoTrue();

    List<Plan> findByActivoFalse();

    Optional<Plan> findByIdPlanAndActivoTrue(Integer idPlan);

    Optional<Plan> findByIdPlanAndActivoFalse(Integer idPlan);

    boolean existsByNombre(String nombre);

    boolean existsByNombreAndIdPlanNot(String nombre, Integer idPlan);
}