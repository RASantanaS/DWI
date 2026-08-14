package com.prunusgym.prunusgym.controller;

import com.prunusgym.prunusgym.dto.UsuarioConRolRequestDTO;
import com.prunusgym.prunusgym.dto.UsuarioRequestDTO;
import com.prunusgym.prunusgym.dto.UsuarioResponseDTO;
import com.prunusgym.prunusgym.entity.Usuario;
import com.prunusgym.prunusgym.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioResponseDTO> listarUsuarios() {
        return usuarioService.obtenerTodosLosUsuarios().stream()
                .map(UsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO obtenerUsuario(@PathVariable Integer id) {
        return new UsuarioResponseDTO(usuarioService.obtenerUsuarioPorId(id));
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponseDTO> registrarCliente(@RequestBody UsuarioRequestDTO dto) {
        Usuario usuarioCreado = usuarioService.registrarCliente(dto);
        return new ResponseEntity<>(new UsuarioResponseDTO(usuarioCreado), HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> crearUsuarioConRol(@RequestBody UsuarioConRolRequestDTO dto) {
        Usuario usuarioCreado = usuarioService.crearUsuarioConRol(dto.getEmail(), dto.getPassword(), dto.getRol());
        return new ResponseEntity<>(new UsuarioResponseDTO(usuarioCreado), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivarUsuario(@PathVariable Integer id) {
        usuarioService.desactivarUsuario(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}/reactivar")
    public ResponseEntity<Void> reactivarUsuario(@PathVariable Integer id) {
        usuarioService.reactivarUsuario(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}