package com.prunusgym.prunusgym.dto;

import java.util.List;

public class DashboardClienteDTO {

    private String nombreCliente;
    private String codigoCliente;
    private MembresiaClienteDTO membresiaActual;
    private List<PagoClienteDTO> pagos;
    private List<AsistenciaClienteDTO> asistencias;

    public DashboardClienteDTO(String nombreCliente, String codigoCliente,
                                MembresiaClienteDTO membresiaActual,
                                List<PagoClienteDTO> pagos,
                                List<AsistenciaClienteDTO> asistencias) {
        this.nombreCliente = nombreCliente;
        this.codigoCliente = codigoCliente;
        this.membresiaActual = membresiaActual;
        this.pagos = pagos;
        this.asistencias = asistencias;
    }

    public String getNombreCliente() { return nombreCliente; }
    public String getCodigoCliente() { return codigoCliente; }
    public MembresiaClienteDTO getMembresiaActual() { return membresiaActual; }
    public List<PagoClienteDTO> getPagos() { return pagos; }
    public List<AsistenciaClienteDTO> getAsistencias() { return asistencias; }
}