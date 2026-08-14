package com.prunusgym.prunusgym.controller;

import com.prunusgym.prunusgym.dto.PagoRequestDTO;
import com.prunusgym.prunusgym.entity.EstadoPago;
import com.prunusgym.prunusgym.entity.MetodoPago;
import com.prunusgym.prunusgym.entity.Pago;
import com.prunusgym.prunusgym.service.PagoService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Pago> listarPagos() {
        return pagoService.obtenerTodosLosPagos();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public Pago obtenerPago(@PathVariable Integer id) {
        return pagoService.obtenerPagoPorId(id);
    }

    @GetMapping("/membresia/{idMembresia}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Pago> obtenerPagosPorMembresia(@PathVariable Integer idMembresia) {
        return pagoService.obtenerPagosPorMembresia(idMembresia);
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA')")
    public List<Pago> buscarPagos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) MetodoPago metodoPago,
            @RequestParam(required = false) EstadoPago estado) {
        return pagoService.buscarPagos(fechaInicio, fechaFin, metodoPago, estado);
    }

    /**
     * Autoservicio: pagos del Cliente autenticado.
     */
    @GetMapping("/mios")
    public List<Pago> obtenerMisPagos(Authentication authentication) {
        return pagoService.obtenerPagosPropios(authentication.getName());
    }

    /**
     * Abierto a cualquier rol autenticado: Admin/Recepcionista pueden registrar pagos de
     * cualquier cliente; un Cliente solo puede pagar su propia membresía -> validado dentro
     * del Service usando el JWT.
     */
    @PostMapping
    public ResponseEntity<Pago> registrarPago(@RequestBody PagoRequestDTO dto, Authentication authentication) {
        Pago pago = pagoService.registrarPago(dto, authentication);

        if (pago.getEstado() == EstadoPago.FALLIDO) {
            return new ResponseEntity<>(pago, HttpStatus.PAYMENT_REQUIRED);
        }

        return new ResponseEntity<>(pago, HttpStatus.CREATED);
    }
}
