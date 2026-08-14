package com.prunusgym.prunusgym.dto;

import com.prunusgym.prunusgym.entity.MetodoPago;
import java.math.BigDecimal;

public class PagoRequestDTO {

    private Integer idMembresia;
    private BigDecimal monto;
    private MetodoPago metodoPago;
    private String referencia;

    public Integer getIdMembresia() {
        return idMembresia;
    }

    public void setIdMembresia(Integer idMembresia) {
        this.idMembresia = idMembresia;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }
}