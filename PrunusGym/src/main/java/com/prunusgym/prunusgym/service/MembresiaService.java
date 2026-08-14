package com.prunusgym.prunusgym.service;

import com.prunusgym.prunusgym.dto.MembresiaRequestDTO;
import com.prunusgym.prunusgym.entity.Cliente;
import com.prunusgym.prunusgym.entity.EstadoMembresia;
import com.prunusgym.prunusgym.entity.Membresia;
import com.prunusgym.prunusgym.entity.Plan;
import com.prunusgym.prunusgym.exception.RecursoNoEncontradoException;
import com.prunusgym.prunusgym.repository.ClienteRepository;
import com.prunusgym.prunusgym.repository.MembresiaRepository;
import com.prunusgym.prunusgym.repository.PlanRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MembresiaService {

    private final MembresiaRepository membresiaRepository;
    private final ClienteRepository clienteRepository;
    private final PlanRepository planRepository;
    private final ClienteService clienteService;

    public MembresiaService(MembresiaRepository membresiaRepository,
                             ClienteRepository clienteRepository,
                             PlanRepository planRepository,
                             ClienteService clienteService) {
        this.membresiaRepository = membresiaRepository;
        this.clienteRepository = clienteRepository;
        this.planRepository = planRepository;
        this.clienteService = clienteService;
    }

    public List<Membresia> obtenerTodasLasMembresias() {
        return membresiaRepository.findAll();
    }

    public Membresia obtenerMembresiaPorId(Integer id) {
        return membresiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Membresía no encontrada con id: " + id));
    }

    public List<Membresia> obtenerMembresiasPorCliente(Integer idCliente) {
        return membresiaRepository.findByCliente_IdCliente(idCliente);
    }

    public List<Membresia> buscarMembresias(LocalDate fechaInicio, LocalDate fechaFin, String estado) {
        List<Membresia> resultado;

        if (fechaInicio != null && fechaFin != null) {
            resultado = membresiaRepository.findByFechaFinBetween(fechaInicio, fechaFin);
        } else {
            resultado = membresiaRepository.findAll();
        }

        if (estado != null && !estado.isBlank()) {
            resultado = resultado.stream()
                    .filter(m -> m.getEstado() != null && estado.equalsIgnoreCase(m.getEstado().name()))
                    .toList();
        }

        return resultado;
    }

    public Membresia cambiarEstado(Integer id, EstadoMembresia estado) {
        Membresia membresia = membresiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Membresía no encontrada con id: " + id));

        membresia.setEstado(estado);
        return membresiaRepository.save(membresia);
    }

    /**
     * Autoservicio: membresías del Cliente autenticado, resuelto vía JWT.
     */
    public List<Membresia> obtenerMembresiasPropias(String email) {
        Cliente cliente = clienteService.obtenerClientePorEmailUsuario(email);
        return membresiaRepository.findByCliente_IdCliente(cliente.getIdCliente());
    }

    /**
     * Si quien llama es rol CLIENTE, se fuerza/valida que la membresía se cree a su propio
     * nombre -> imposible crear membresías a nombre de otro cliente manipulando el body.
     */
    public Membresia crearMembresia(MembresiaRequestDTO dto, Authentication authentication) {
        if (esRolCliente(authentication)) {
            Cliente clientePropio = clienteService.obtenerClientePorEmailUsuario(authentication.getName());

            if (dto.getIdCliente() != null && !dto.getIdCliente().equals(clientePropio.getIdCliente())) {
                throw new AccessDeniedException("No puede crear una membresía a nombre de otro cliente.");
            }
            dto.setIdCliente(clientePropio.getIdCliente());
        }

        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + dto.getIdCliente()));

        Plan plan = planRepository.findById(dto.getIdPlan())
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado con id: " + dto.getIdPlan()));

        LocalDate fechaInicio = calcularFechaInicio(cliente.getIdCliente(), dto.getFechaInicio());
        LocalDate fechaFin = fechaInicio.plusDays(plan.getDuracionDias());

        Membresia membresia = new Membresia();
        membresia.setCliente(cliente);
        membresia.setPlan(plan);
        membresia.setFechaInicio(fechaInicio);
        membresia.setFechaFin(fechaFin);

        return membresiaRepository.save(membresia);
    }

    public Membresia actualizarMembresia(Integer id, MembresiaRequestDTO dto) {
        Membresia membresiaExistente = membresiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Membresía no encontrada con id: " + id));

        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + dto.getIdCliente()));

        Plan plan = planRepository.findById(dto.getIdPlan())
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado con id: " + dto.getIdPlan()));

        LocalDate fechaInicio = dto.getFechaInicio() != null ? dto.getFechaInicio() : membresiaExistente.getFechaInicio();
        LocalDate fechaFin = fechaInicio.plusDays(plan.getDuracionDias());

        membresiaExistente.setCliente(cliente);
        membresiaExistente.setPlan(plan);
        membresiaExistente.setFechaInicio(fechaInicio);
        membresiaExistente.setFechaFin(fechaFin);

        return membresiaRepository.save(membresiaExistente);
    }

    /**
     * Encola la nueva membresía: si el cliente ya tiene una membresía cuya vigencia
     * (fecha_fin) es igual o posterior al inicio solicitado, la nueva arranca justo
     * el día en que termina esa membresía en curso.
     */
    private LocalDate calcularFechaInicio(Integer idCliente, LocalDate fechaInicioSolicitada) {
        LocalDate base = fechaInicioSolicitada != null ? fechaInicioSolicitada : LocalDate.now();

        LocalDate ultimaFechaFin = membresiaRepository.findByCliente_IdCliente(idCliente).stream()
                .map(Membresia::getFechaFin)
                .filter(fin -> !fin.isBefore(base))
                .max(LocalDate::compareTo)
                .orElse(null);

        return ultimaFechaFin != null ? ultimaFechaFin : base;
    }

    /**
     * Borrado lógico: se marca como INACTIVA en lugar de eliminarse físicamente,
     * evitando el conflicto de integridad referencial (pagos asociados) que se producía
     * al intentar borrar membresías duplicadas (mismo plan, fecha y hora) que ya tenían
     * un pago registrado.
     */
    public void eliminarMembresia(Integer id) {
        Membresia membresia = membresiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Membresía no encontrada con id: " + id));

        membresia.setEstado(EstadoMembresia.INACTIVA);
        membresiaRepository.save(membresia);
    }

    private boolean esRolCliente(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CLIENTE"));
    }
}
