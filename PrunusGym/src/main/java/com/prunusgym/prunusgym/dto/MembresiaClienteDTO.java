package com.prunusgym.prunusgym.dto;

import java.time.LocalDate;

public class MembresiaClienteDTO {

    private String nombrePlan;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;

    public MembresiaClienteDTO(String nombrePlan, LocalDate fechaInicio, LocalDate fechaFin, String estado) {
        this.nombrePlan = nombrePlan;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = estado;
    }

    public String getNombrePlan() { return nombrePlan; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public LocalDate getFechaFin() { return fechaFin; }
    public String getEstado() { return estado; }
}