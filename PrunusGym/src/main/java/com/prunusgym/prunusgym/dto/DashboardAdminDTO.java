package com.prunusgym.prunusgym.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardAdminDTO {

    private long totalClientesActivos;
    private long membresiasActivas;
    private long membresiasProximasAVencer;
    private long membresiasVencidas;
    private long asistenciasHoy;
    private BigDecimal ingresosMes;
    private List<AlertaMembresiaDTO> alertasProximasAVencer;
    private List<AlertaMembresiaDTO> alertasVencidas;

    public DashboardAdminDTO(long totalClientesActivos, long membresiasActivas,
                              long membresiasProximasAVencer, long membresiasVencidas,
                              long asistenciasHoy, BigDecimal ingresosMes,
                              List<AlertaMembresiaDTO> alertasProximasAVencer,
                              List<AlertaMembresiaDTO> alertasVencidas) {
        this.totalClientesActivos = totalClientesActivos;
        this.membresiasActivas = membresiasActivas;
        this.membresiasProximasAVencer = membresiasProximasAVencer;
        this.membresiasVencidas = membresiasVencidas;
        this.asistenciasHoy = asistenciasHoy;
        this.ingresosMes = ingresosMes;
        this.alertasProximasAVencer = alertasProximasAVencer;
        this.alertasVencidas = alertasVencidas;
    }

    public long getTotalClientesActivos() { return totalClientesActivos; }
    public long getMembresiasActivas() { return membresiasActivas; }
    public long getMembresiasProximasAVencer() { return membresiasProximasAVencer; }
    public long getMembresiasVencidas() { return membresiasVencidas; }
    public long getAsistenciasHoy() { return asistenciasHoy; }
    public BigDecimal getIngresosMes() { return ingresosMes; }
    public List<AlertaMembresiaDTO> getAlertasProximasAVencer() { return alertasProximasAVencer; }
    public List<AlertaMembresiaDTO> getAlertasVencidas() { return alertasVencidas; }
}