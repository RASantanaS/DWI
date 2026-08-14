package com.prunusgym.prunusgym.service;

import com.prunusgym.prunusgym.dto.PagoRequestDTO;
import com.prunusgym.prunusgym.entity.Cliente;
import com.prunusgym.prunusgym.entity.EstadoPago;
import com.prunusgym.prunusgym.entity.Membresia;
import com.prunusgym.prunusgym.entity.MetodoPago;
import com.prunusgym.prunusgym.entity.Pago;
import com.prunusgym.prunusgym.exception.RecursoNoEncontradoException;
import com.prunusgym.prunusgym.repository.MembresiaRepository;
import com.prunusgym.prunusgym.repository.PagoRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final MembresiaRepository membresiaRepository;
    private final ClienteService clienteService;

    public PagoService(PagoRepository pagoRepository, MembresiaRepository membresiaRepository,
                        ClienteService clienteService) {
        this.pagoRepository = pagoRepository;
        this.membresiaRepository = membresiaRepository;
        this.clienteService = clienteService;
    }

    public List<Pago> obtenerTodosLosPagos() {
        return pagoRepository.findAll();
    }

    public Pago obtenerPagoPorId(Integer id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado con id: " + id));
    }

    public List<Pago> obtenerPagosPorMembresia(Integer idMembresia) {
        return pagoRepository.findByMembresia_IdMembresia(idMembresia);
    }

    public List<Pago> buscarPagos(LocalDate fechaInicio, LocalDate fechaFin,
                                   MetodoPago metodoPago, EstadoPago estado) {
        List<Pago> resultado;

        if (fechaInicio != null && fechaFin != null) {
            LocalDateTime inicio = fechaInicio.atStartOfDay();
            LocalDateTime fin = fechaFin.plusDays(1).atStartOfDay();
            resultado = pagoRepository.findByFechaPagoBetween(inicio, fin);
        } else {
            resultado = pagoRepository.findAll();
        }

        if (metodoPago != null) {
            resultado = resultado.stream()
                    .filter(p -> p.getMetodoPago() == metodoPago)
                    .toList();
        }

        if (estado != null) {
            resultado = resultado.stream()
                    .filter(p -> p.getEstado() == estado)
                    .toList();
        }

        return resultado;
    }

    /**
     * Autoservicio: pagos del Cliente autenticado (a través de sus membresías).
     */
    public List<Pago> obtenerPagosPropios(String email) {
        Cliente cliente = clienteService.obtenerClientePorEmailUsuario(email);
        List<Membresia> membresiasDelCliente = membresiaRepository.findByCliente_IdCliente(cliente.getIdCliente());

        return membresiasDelCliente.stream()
                .flatMap(m -> pagoRepository.findByMembresia_IdMembresia(m.getIdMembresia()).stream())
                .toList();
    }

    /**
     * Si quien llama es rol CLIENTE, se valida que la membresía que está pagando le
     * pertenezca -> imposible pagar (o renovar) a nombre de otro cliente.
     */
    public Pago registrarPago(PagoRequestDTO dto, Authentication authentication) {
        Membresia membresia = membresiaRepository.findById(dto.getIdMembresia())
                .orElseThrow(() -> new RecursoNoEncontradoException("Membresía no encontrada con id: " + dto.getIdMembresia()));

        if (esRolCliente(authentication)) {
            Cliente clientePropio = clienteService.obtenerClientePorEmailUsuario(authentication.getName());
            if (!membresia.getCliente().getIdCliente().equals(clientePropio.getIdCliente())) {
                throw new AccessDeniedException("No puede registrar un pago sobre una membresía que no es suya.");
            }
        }

        if (dto.getMonto() == null || dto.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a 0.");
        }

        Pago pago = new Pago();
        pago.setMembresia(membresia);
        pago.setMonto(dto.getMonto());
        pago.setMetodoPago(dto.getMetodoPago());
        pago.setReferencia(dto.getReferencia());

        BigDecimal precioPlan = membresia.getPlan().getPrecio();

        if (dto.getMonto().compareTo(precioPlan) == 0) {
            pago.setEstado(EstadoPago.COMPLETADO);
        } else {
            pago.setEstado(EstadoPago.FALLIDO);
        }

        return pagoRepository.save(pago);
    }

    private boolean esRolCliente(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CLIENTE"));
    }
}
