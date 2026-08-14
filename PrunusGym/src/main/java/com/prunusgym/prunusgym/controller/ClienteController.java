package com.prunusgym.prunusgym.controller;

import com.prunusgym.prunusgym.dto.ClienteRequestDTO;
import com.prunusgym.prunusgym.entity.Cliente;
import com.prunusgym.prunusgym.service.ClienteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Cliente> listarClientes() {
        return clienteService.obtenerTodosLosClientes();
    }

    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Cliente> listarClientesActivos() {
        return clienteService.obtenerClientesActivos();
    }

    @GetMapping("/inactivos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Cliente> listarClientesInactivos() {
        return clienteService.obtenerClientesInactivos();
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Cliente> buscarClientes(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String documento) {
        return clienteService.buscarClientes(nombre, documento);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public Cliente obtenerCliente(@PathVariable Integer id) {
        return clienteService.obtenerClientePorId(id);
    }

    @GetMapping("/activos/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public Cliente obtenerClienteActivoPorId(@PathVariable Integer id) {
        return clienteService.obtenerClienteActivoPorId(id);
    }

    @GetMapping("/inactivos/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public Cliente obtenerClienteInactivoPorId(@PathVariable Integer id) {
        return clienteService.obtenerClienteInactivoPorId(id);
    }

    @GetMapping("/codigo/{codigo}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public Cliente obtenerClientePorCodigo(@PathVariable String codigo) {
        return clienteService.buscarPorCodigo(codigo);
    }

    /**
     * Autoservicio: el Cliente consulta su propio perfil, resuelto 100% desde el JWT.
     * No recibe ningún id por parámetro -> imposible pedir el perfil de otro cliente.
     */
    @GetMapping("/perfil")
    public Cliente obtenerPerfilPropio(Authentication authentication) {
        return clienteService.obtenerPerfilPropio(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@RequestBody ClienteRequestDTO dto) {
        Cliente clienteCreado = clienteService.crearCliente(dto);
        return new ResponseEntity<>(clienteCreado, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<Cliente> actualizarCliente(@PathVariable Integer id, @RequestBody ClienteRequestDTO dto) {
        Cliente clienteActualizado = clienteService.actualizarCliente(id, dto);
        return new ResponseEntity<>(clienteActualizado, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<Void> desactivarCliente(@PathVariable Integer id) {
        clienteService.desactivarCliente(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}/reactivar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public ResponseEntity<Void> reactivarCliente(@PathVariable Integer id) {
        clienteService.reactivarCliente(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
