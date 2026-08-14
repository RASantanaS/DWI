package com.prunusgym.prunusgym.service;

import com.prunusgym.prunusgym.dto.*;
import com.prunusgym.prunusgym.entity.*;
import com.prunusgym.prunusgym.exception.RecursoNoEncontradoException;
import com.prunusgym.prunusgym.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DashboardService {

    private final ClienteRepository clienteRepository;
    private final MembresiaRepository membresiaRepository;
    private final PagoRepository pagoRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardService(ClienteRepository clienteRepository,
                             MembresiaRepository membresiaRepository,
                             PagoRepository pagoRepository,
                             AsistenciaRepository asistenciaRepository,
                             UsuarioRepository usuarioRepository) {
        this.clienteRepository = clienteRepository;
        this.membresiaRepository = membresiaRepository;
        this.pagoRepository = pagoRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ---------- ADMINISTRADOR ----------

    public DashboardAdminDTO obtenerIndicadoresAdmin() {
        List<Membresia> todasLasMembresias = membresiaRepository.findAll();

        long activas = contarPorEstado(todasLasMembresias, "Activa");
        long proximasAVencer = contarPorEstado(todasLasMembresias, "Próxima a vencer");
        long vencidas = contarPorEstado(todasLasMembresias, "Vencida");

        long totalClientesActivos = clienteRepository.findByActivoTrue().size();
        long asistenciasHoy = contarAsistenciasHoy();
        BigDecimal ingresosMes = calcularIngresosMes();

        List<AlertaMembresiaDTO> alertasProximas = construirAlertas(todasLasMembresias, "Próxima a vencer");
        List<AlertaMembresiaDTO> alertasVencidas = construirAlertas(todasLasMembresias, "Vencida");

        return new DashboardAdminDTO(totalClientesActivos, activas, proximasAVencer, vencidas,
                asistenciasHoy, ingresosMes, alertasProximas, alertasVencidas);
    }

    // ---------- RECEPCIONISTA ----------

    public DashboardRecepcionistaDTO obtenerIndicadoresRecepcionista() {
        List<Membresia> todasLasMembresias = membresiaRepository.findAll();

        long activas = contarPorEstado(todasLasMembresias, "Activa");
        long proximasAVencer = contarPorEstado(todasLasMembresias, "Próxima a vencer");
        long vencidas = contarPorEstado(todasLasMembresias, "Vencida");

        long totalClientesActivos = clienteRepository.findByActivoTrue().size();
        long asistenciasHoy = contarAsistenciasHoy();

        List<AlertaMembresiaDTO> alertasProximas = construirAlertas(todasLasMembresias, "Próxima a vencer");
        List<AlertaMembresiaDTO> alertasVencidas = construirAlertas(todasLasMembresias, "Vencida");

        return new DashboardRecepcionistaDTO(totalClientesActivos, activas, proximasAVencer, vencidas,
                asistenciasHoy, alertasProximas, alertasVencidas);
    }

    // ---------- CLIENTE ----------

    public DashboardClienteDTO obtenerIndicadoresCliente(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + email));

        Cliente cliente = clienteRepository.findByIdUsuario(usuario.getIdUsuario())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un Cliente vinculado a este usuario."));

        List<Membresia> membresiasDelCliente = membresiaRepository.findByCliente_IdCliente(cliente.getIdCliente());

        MembresiaClienteDTO membresiaActual = membresiasDelCliente.stream()
                .max(Comparator.comparing(m -> m.getFechaFin()))
                .map(m -> new MembresiaClienteDTO(m.getPlan().getNombre(), m.getFechaInicio(), m.getFechaFin(), m.getVigencia()))
                .orElse(null);

        List<PagoClienteDTO> pagos = new ArrayList<>();
        for (Membresia m : membresiasDelCliente) {
            for (Pago p : pagoRepository.findByMembresia_IdMembresia(m.getIdMembresia())) {
                pagos.add(new PagoClienteDTO(p.getMonto(), p.getMetodoPago(), p.getEstado(), p.getFechaPago()));
            }
        }

        List<AsistenciaClienteDTO> asistencias = new ArrayList<>();
        for (Asistencia a : asistenciaRepository.findByCliente_IdCliente(cliente.getIdCliente())) {
            asistencias.add(new AsistenciaClienteDTO(a.getFechaHora()));
        }

        String nombreCompleto = cliente.getNombre() + " " + cliente.getApellido();
        return new DashboardClienteDTO(nombreCompleto, cliente.getCodigo(), membresiaActual, pagos, asistencias);
    }

    // ---------- Helpers privados compartidos ----------

    private long contarPorEstado(List<Membresia> membresias, String estado) {
        return membresias.stream().filter(m -> estado.equals(m.getVigencia())).count();
    }

    private List<AlertaMembresiaDTO> construirAlertas(List<Membresia> membresias, String estado) {
        List<AlertaMembresiaDTO> alertas = new ArrayList<>();
        for (Membresia m : membresias) {
            if (estado.equals(m.getVigencia())) {
                alertas.add(new AlertaMembresiaDTO(
                        m.getIdMembresia(),
                        m.getCliente().getCodigo(),
                        m.getCliente().getNombre() + " " + m.getCliente().getApellido(),
                        m.getCliente().getTelefono(),
                        m.getPlan().getNombre(),
                        m.getFechaFin(),
                        m.getVigencia()
                ));
            }
        }
        return alertas;
    }

    private long contarAsistenciasHoy() {
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().plusDays(1).atStartOfDay();
        return asistenciaRepository.countByFechaHoraBetween(inicioHoy, finHoy);
    }

    private BigDecimal calcularIngresosMes() {
        YearMonth mesActual = YearMonth.now();
        LocalDateTime inicioMes = mesActual.atDay(1).atStartOfDay();
        LocalDateTime finMes = mesActual.plusMonths(1).atDay(1).atStartOfDay();
        List<Pago> pagosDelMes = pagoRepository.findByEstadoAndFechaPagoBetween(EstadoPago.COMPLETADO, inicioMes, finMes);

        BigDecimal total = BigDecimal.ZERO;
        for (Pago pago : pagosDelMes) {
            total = total.add(pago.getMonto());
        }
        return total;
    }
}