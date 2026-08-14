package com.prunusgym.prunusgym.dto;

import com.prunusgym.prunusgym.entity.EstadoPago;
import com.prunusgym.prunusgym.entity.MetodoPago;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PagoClienteDTO {

    private BigDecimal monto;
    private MetodoPago metodoPago;
    private EstadoPago estado;
    private LocalDateTime fechaPago;

    public PagoClienteDTO(BigDecimal monto, MetodoPago metodoPago, EstadoPago estado, LocalDateTime fechaPago) {
        this.monto = monto;
        this.metodoPago = metodoPago;
        this.estado = estado;
        this.fechaPago = fechaPago;
    }

    public BigDecimal getMonto() { return monto; }
    public MetodoPago getMetodoPago() { return metodoPago; }
    public EstadoPago getEstado() { return estado; }
    public LocalDateTime getFechaPago() { return fechaPago; }
}