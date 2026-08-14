package com.prunusgym.prunusgym.dto;

import com.prunusgym.prunusgym.entity.Rol;
import com.prunusgym.prunusgym.entity.Usuario;

public class UsuarioResponseDTO {

    private Integer idUsuario;
    private String email;
    private Rol rol;
    private Boolean activo;

    public UsuarioResponseDTO(Usuario usuario) {
        this.idUsuario = usuario.getIdUsuario();
        this.email = usuario.getEmail();
        this.rol = usuario.getRol();
        this.activo = usuario.getActivo();
    }

    public Integer getIdUsuario() { return idUsuario; }
    public String getEmail() { return email; }
    public Rol getRol() { return rol; }
    public Boolean getActivo() { return activo; }
}