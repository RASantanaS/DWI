package com.empresa.sistema_empleados.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// Controlador simple para que al entrar a http://localhost:8080/
// se muestre directamente la lista de empleados como pagina de inicio.
@Controller
public class HomeController {

    @GetMapping("/")
    public String raiz() {
        return "redirect:/empleados";
    }
}
