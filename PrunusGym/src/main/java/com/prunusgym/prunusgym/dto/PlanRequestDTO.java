package com.prunusgym.prunusgym.dto;

import java.math.BigDecimal;

public class PlanRequestDTO {

    private String nombre;
    private BigDecimal precio;
    private Integer duracionDias;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getDuracionDias() {
        return duracionDias;
    }

    public void setDuracionDias(Integer duracionDias) {
        this.duracionDias = duracionDias;
    }
}