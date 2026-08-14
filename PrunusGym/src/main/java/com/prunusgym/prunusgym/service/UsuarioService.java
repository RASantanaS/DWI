package com.prunusgym.prunusgym.service;

import com.prunusgym.prunusgym.dto.UsuarioRequestDTO;
import com.prunusgym.prunusgym.entity.Rol;
import com.prunusgym.prunusgym.entity.Usuario;
import com.prunusgym.prunusgym.exception.RecursoDuplicadoException;
import com.prunusgym.prunusgym.exception.RecursoNoEncontradoException;
import com.prunusgym.prunusgym.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario obtenerUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));
    }

    /**
     * Autoregistro público (o registro hecho por Recepcionista en persona).
     * SIEMPRE asigna rol CLIENTE — no permite elegir rol, por diseño.
     * Endpoint expuesto: POST /api/usuarios/registro
     */
    public Usuario registrarCliente(UsuarioRequestDTO dto) {
        return crearUsuarioInterno(dto.getEmail(), dto.getPassword(), Rol.CLIENTE);
    }

    /**
     * Creación de usuario con rol libre (Administrador, Recepcionista o Cliente).
     * PENDIENTE: método ya funcional, pero el endpoint que lo expone en el
     * Controller está comentado hasta implementar Autenticación, porque se
     * necesita verificar que quien llama sea un ADMINISTRADOR autenticado.
     * NO exponer sin esa protección.
     */
    public Usuario crearUsuarioConRol(String email, String password, Rol rol) {
        return crearUsuarioInterno(email, password, rol);
    }

    public void desactivarUsuario(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));

        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    public void reactivarUsuario(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));

        usuario.setActivo(true);
        usuarioRepository.save(usuario);
    }

    private Usuario crearUsuarioInterno(String email, String password, Rol rol) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new RecursoDuplicadoException("Ya existe un usuario con el email: " + email);
        }

        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres.");
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setRol(rol);
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }
}