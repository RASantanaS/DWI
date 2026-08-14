package com.prunusgym.prunusgym.dto;

import java.util.List;

public class DashboardRecepcionistaDTO {

    private long totalClientesActivos;
    private long membresiasActivas;
    private long membresiasProximasAVencer;
    private long membresiasVencidas;
    private long asistenciasHoy;
    private List<AlertaMembresiaDTO> alertasProximasAVencer;
    private List<AlertaMembresiaDTO> alertasVencidas;

    public DashboardRecepcionistaDTO(long totalClientesActivos, long membresiasActivas,
                                      long membresiasProximasAVencer, long membresiasVencidas,
                                      long asistenciasHoy,
                                      List<AlertaMembresiaDTO> alertasProximasAVencer,
                                      List<AlertaMembresiaDTO> alertasVencidas) {
        this.totalClientesActivos = totalClientesActivos;
        this.membresiasActivas = membresiasActivas;
        this.membresiasProximasAVencer = membresiasProximasAVencer;
        this.membresiasVencidas = membresiasVencidas;
        this.asistenciasHoy = asistenciasHoy;
        this.alertasProximasAVencer = alertasProximasAVencer;
        this.alertasVencidas = alertasVencidas;
    }

    public long getTotalClientesActivos() { return totalClientesActivos; }
    public long getMembresiasActivas() { return membresiasActivas; }
    public long getMembresiasProximasAVencer() { return membresiasProximasAVencer; }
    public long getMembresiasVencidas() { return membresiasVencidas; }
    public long getAsistenciasHoy() { return asistenciasHoy; }
    public List<AlertaMembresiaDTO> getAlertasProximasAVencer() { return alertasProximasAVencer; }
    public List<AlertaMembresiaDTO> getAlertasVencidas() { return alertasVencidas; }
}