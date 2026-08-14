package com.prunusgym.prunusgym.dto;

import java.time.LocalDateTime;

public class AsistenciaClienteDTO {

    private LocalDateTime fechaHora;

    public AsistenciaClienteDTO(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public LocalDateTime getFechaHora() { return fechaHora; }
}