package com.prunusgym.prunusgym.controller;

import com.prunusgym.prunusgym.dto.LoginRequestDTO;
import com.prunusgym.prunusgym.dto.LoginResponseDTO;
import com.prunusgym.prunusgym.entity.Usuario;
import com.prunusgym.prunusgym.repository.UsuarioRepository;
import com.prunusgym.prunusgym.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                           UsuarioRepository usuarioRepository,
                           JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name(), usuario.getIdUsuario());

        return ResponseEntity.ok(new LoginResponseDTO(token, usuario.getEmail(), usuario.getRol().name()));
    }
}