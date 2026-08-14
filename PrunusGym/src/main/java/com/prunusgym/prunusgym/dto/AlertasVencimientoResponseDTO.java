package com.prunusgym.prunusgym.dto;

import java.util.List;

public class AlertasVencimientoResponseDTO {

    private List<AlertaMembresiaDTO> proximasAVencer;
    private List<AlertaMembresiaDTO> vencidas;
    private List<AlertaMembresiaDTO> activas;

    public AlertasVencimientoResponseDTO(List<AlertaMembresiaDTO> proximasAVencer,
                                          List<AlertaMembresiaDTO> vencidas,
                                          List<AlertaMembresiaDTO> activas) {
        this.proximasAVencer = proximasAVencer;
        this.vencidas = vencidas;
        this.activas = activas;
    }

    public List<AlertaMembresiaDTO> getProximasAVencer() { return proximasAVencer; }
    public List<AlertaMembresiaDTO> getVencidas() { return vencidas; }
    public List<AlertaMembresiaDTO> getActivas() { return activas; }
}