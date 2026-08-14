package com.prunusgym.prunusgym.service;

import com.prunusgym.prunusgym.dto.ClienteRequestDTO;
import com.prunusgym.prunusgym.dto.UsuarioRequestDTO;
import com.prunusgym.prunusgym.entity.Cliente;
import com.prunusgym.prunusgym.entity.Usuario;
import com.prunusgym.prunusgym.exception.RecursoDuplicadoException;
import com.prunusgym.prunusgym.exception.RecursoNoEncontradoException;
import com.prunusgym.prunusgym.repository.ClienteRepository;
import com.prunusgym.prunusgym.repository.UsuarioRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;

    public ClienteService(ClienteRepository clienteRepository, UsuarioService usuarioService,
                           UsuarioRepository usuarioRepository) {
        this.clienteRepository = clienteRepository;
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Cliente> obtenerTodosLosClientes() {
        return clienteRepository.findAll();
    }

    public List<Cliente> obtenerClientesActivos() {
        return clienteRepository.findByActivoTrue();
    }

    public List<Cliente> obtenerClientesInactivos() {
        return clienteRepository.findByActivoFalse();
    }

    public Cliente obtenerClientePorId(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + id));
    }

    public Cliente obtenerClienteActivoPorId(Integer id) {
        return clienteRepository.findByIdClienteAndActivoTrue(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente activo no encontrado con id: " + id));
    }

    public Cliente obtenerClienteInactivoPorId(Integer id) {
        return clienteRepository.findByIdClienteAndActivoFalse(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente inactivo no encontrado con id: " + id));
    }

    public Cliente buscarPorCodigo(String codigo) {
        if (codigo == null || !codigo.toUpperCase().matches("^PG-[A-Z0-9]{4}$")) {
            throw new RecursoNoEncontradoException("Formato de código inválido: " + codigo);
        }

        String parteBase36 = codigo.substring(3);
        Integer id;
        try {
            id = Integer.parseInt(parteBase36, 36);
        } catch (NumberFormatException e) {
            throw new RecursoNoEncontradoException("Código inválido: " + codigo);
        }

        return obtenerClientePorId(id);
    }

    public List<Cliente> buscarClientes(String nombre, String documento) {
        if (nombre != null && !nombre.isBlank()) {
            return clienteRepository.findByNombreContainingIgnoreCase(nombre);
        }
        if (documento != null && !documento.isBlank()) {
            return clienteRepository.findByDocumentoContaining(documento);
        }
        return clienteRepository.findByActivoTrue();
    }

    /**
     * Resuelve el Cliente vinculado al Usuario autenticado (vía email del JWT).
     * Punto único de "token -> Cliente propio", reutilizado por Membresia/Pago/Asistencia.
     */
    public Cliente obtenerClientePorEmailUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + email));

        return clienteRepository.findByIdUsuario(usuario.getIdUsuario())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un Cliente vinculado a este usuario."));
    }

    public Cliente obtenerPerfilPropio(String email) {
        return obtenerClientePorEmailUsuario(email);
    }

    @Transactional
    public Cliente crearCliente(ClienteRequestDTO dto) {
        if (clienteRepository.existsByDocumento(dto.getDocumento())) {
            throw new RecursoDuplicadoException("Ya existe un cliente con el documento: " + dto.getDocumento());
        }

        UsuarioRequestDTO usuarioDto = new UsuarioRequestDTO();
        usuarioDto.setEmail(dto.getEmail());
        usuarioDto.setPassword(dto.getPassword());
        Usuario usuarioCreado = usuarioService.registrarCliente(usuarioDto);

        Cliente cliente = new Cliente();
        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setDocumento(dto.getDocumento());
        cliente.setTelefono(dto.getTelefono());
        cliente.setIdUsuario(usuarioCreado.getIdUsuario());
        cliente.setActivo(true);

        return clienteRepository.save(cliente);
    }

    public Cliente actualizarCliente(Integer id, ClienteRequestDTO dto) {
        Cliente clienteExistente = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + id));

        if (clienteRepository.existsByDocumentoAndIdClienteNot(dto.getDocumento(), id)) {
            throw new RecursoDuplicadoException("Ya existe otro cliente con el documento: " + dto.getDocumento());
        }

        clienteExistente.setNombre(dto.getNombre());
        clienteExistente.setApellido(dto.getApellido());
        clienteExistente.setDocumento(dto.getDocumento());
        clienteExistente.setTelefono(dto.getTelefono());

        return clienteRepository.save(clienteExistente);
    }

    public void desactivarCliente(Integer id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + id));

        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    public void reactivarCliente(Integer id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + id));

        cliente.setActivo(true);
        clienteRepository.save(cliente);
    }
}
