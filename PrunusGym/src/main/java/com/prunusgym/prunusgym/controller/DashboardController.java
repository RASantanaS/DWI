package com.prunusgym.prunusgym.controller;

import com.prunusgym.prunusgym.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<?> obtenerDashboard(Authentication authentication) {
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));
        boolean esRecepcionista = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RECEPCIONISTA"));

        if (esAdmin) {
            return ResponseEntity.ok(dashboardService.obtenerIndicadoresAdmin());
        } else if (esRecepcionista) {
            return ResponseEntity.ok(dashboardService.obtenerIndicadoresRecepcionista());
        } else {
            return ResponseEntity.ok(dashboardService.obtenerIndicadoresCliente(authentication.getName()));
        }
    }
}