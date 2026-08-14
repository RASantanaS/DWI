package com.prunusgym.prunusgym.dto;

import com.prunusgym.prunusgym.entity.Rol;

public class UsuarioConRolRequestDTO {

    private String email;
    private String password;
    private Rol rol;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }
}