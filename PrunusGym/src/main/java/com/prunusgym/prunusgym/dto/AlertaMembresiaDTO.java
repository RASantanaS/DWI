package com.prunusgym.prunusgym.dto;

import java.time.LocalDate;

public class AlertaMembresiaDTO {

    private Integer idMembresia;
    private String codigoCliente;
    private String nombreCliente;
    private String telefonoCliente;
    private String nombrePlan;
    private LocalDate fechaFin;
    private String estado;

    public AlertaMembresiaDTO(Integer idMembresia, String codigoCliente, String nombreCliente,
                               String telefonoCliente, String nombrePlan, LocalDate fechaFin, String estado) {
        this.idMembresia = idMembresia;
        this.codigoCliente = codigoCliente;
        this.nombreCliente = nombreCliente;
        this.telefonoCliente = telefonoCliente;
        this.nombrePlan = nombrePlan;
        this.fechaFin = fechaFin;
        this.estado = estado;
    }

    public Integer getIdMembresia() { return idMembresia; }
    public String getCodigoCliente() { return codigoCliente; }
    public String getNombreCliente() { return nombreCliente; }
    public String getTelefonoCliente() { return telefonoCliente; }
    public String getNombrePlan() { return nombrePlan; }
    public LocalDate getFechaFin() { return fechaFin; }
    public String getEstado() { return estado; }
}