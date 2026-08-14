package com.prunusgym.prunusgym.service;

import com.prunusgym.prunusgym.dto.AsistenciaRequestDTO;
import com.prunusgym.prunusgym.entity.Asistencia;
import com.prunusgym.prunusgym.entity.Cliente;
import com.prunusgym.prunusgym.entity.Membresia;
import com.prunusgym.prunusgym.exception.RecursoNoEncontradoException;
import com.prunusgym.prunusgym.repository.AsistenciaRepository;
import com.prunusgym.prunusgym.repository.ClienteRepository;
import com.prunusgym.prunusgym.repository.MembresiaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final ClienteRepository clienteRepository;
    private final MembresiaRepository membresiaRepository;
    private final ClienteService clienteService;

    public AsistenciaService(AsistenciaRepository asistenciaRepository,
                              ClienteRepository clienteRepository,
                              MembresiaRepository membresiaRepository,
                              ClienteService clienteService) {
        this.asistenciaRepository = asistenciaRepository;
        this.clienteRepository = clienteRepository;
        this.membresiaRepository = membresiaRepository;
        this.clienteService = clienteService;
    }

    public List<Asistencia> obtenerTodasLasAsistencias() {
        return asistenciaRepository.findAll();
    }

    public Asistencia obtenerAsistenciaPorId(Integer id) {
        return asistenciaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asistencia no encontrada con id: " + id));
    }

    public List<Asistencia> obtenerAsistenciasPorCliente(Integer idCliente) {
        return asistenciaRepository.findByCliente_IdCliente(idCliente);
    }

    public List<Asistencia> buscarAsistencias(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.plusDays(1).atStartOfDay();
        return asistenciaRepository.findByFechaHoraBetween(inicio, fin);
    }

    /**
     * Autoservicio: asistencias del Cliente autenticado.
     */
    public List<Asistencia> obtenerAsistenciasPropias(String email) {
        Cliente cliente = clienteService.obtenerClientePorEmailUsuario(email);
        return asistenciaRepository.findByCliente_IdCliente(cliente.getIdCliente());
    }

    public Asistencia registrarAsistencia(AsistenciaRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + dto.getIdCliente()));

        List<Membresia> membresias = membresiaRepository.findByCliente_IdCliente(dto.getIdCliente());

        boolean tieneMembresiaVigente = membresias.stream()
                .anyMatch(m -> !"Vencida".equals(m.getVigencia()));

        if (!tieneMembresiaVigente) {
            throw new IllegalArgumentException("El cliente no tiene una membresía activa. Debe adquirir o renovar un plan antes de ingresar.");
        }

        Asistencia asistencia = new Asistencia();
        asistencia.setCliente(cliente);

        return asistenciaRepository.save(asistencia);
    }
}
