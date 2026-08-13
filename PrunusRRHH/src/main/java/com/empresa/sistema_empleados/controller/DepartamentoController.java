package com.empresa.sistema_empleados.controller;

import com.empresa.sistema_empleados.entity.Departamento;
import com.empresa.sistema_empleados.service.DepartamentoService;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

// @Controller (no @RestController) porque devolvemos VISTAS (nombres de plantillas
// Thymeleaf), no JSON. Cada metodo retorna un String con el nombre del template
// a renderizar, o un "redirect:/ruta" para redirigir a otra URL.
@Controller
@RequestMapping("/departamentos")
public class DepartamentoController {

    private final DepartamentoService departamentoService;

    public DepartamentoController(DepartamentoService departamentoService) {
        this.departamentoService = departamentoService;
    }

    // GET /departamentos -> lista todos los departamentos
    @GetMapping
    public String listar(Model model) {
        model.addAttribute("departamentos", departamentoService.listarTodos());
        model.addAttribute("titulo", "Departamentos");
        model.addAttribute("seccion", "departamentos");
        model.addAttribute("contenido", "departamentos/lista :: contenido");
        return "layout";
    }

    // GET /departamentos/nuevo -> muestra formulario vacio para crear
    @GetMapping("/nuevo")
    public String mostrarFormularioNuevo(Model model) {
        model.addAttribute("departamento", new Departamento());
        model.addAttribute("titulo", "Nuevo Departamento");
        model.addAttribute("seccion", "departamentos");
        model.addAttribute("contenido", "departamentos/formulario :: contenido");
        return "layout";
    }

    // GET /departamentos/editar/{id} -> muestra formulario con datos existentes
    @GetMapping("/editar/{id}")
    public String mostrarFormularioEditar(@PathVariable Long id, Model model) {
        model.addAttribute("departamento", departamentoService.buscarPorId(id));
        model.addAttribute("titulo", "Editar Departamento");
        model.addAttribute("seccion", "departamentos");
        model.addAttribute("contenido", "departamentos/formulario :: contenido");
        return "layout";
    }

    // POST /departamentos/guardar -> procesa tanto creacion como edicion
    // @Valid activa las validaciones definidas en la entidad (@NotBlank, etc.)
    // BindingResult debe ir INMEDIATAMENTE despues del objeto @Valid, y captura
    // los errores de validacion en vez de lanzar una excepcion.
    @PostMapping("/guardar")
    public String guardar(@Valid @ModelAttribute("departamento") Departamento departamento,
                           BindingResult bindingResult,
                           Model model,
                           RedirectAttributes redirectAttributes) {

        if (bindingResult.hasErrors()) {
            // Si hay errores de validacion, regresamos al mismo formulario
            // mostrando los mensajes (Thymeleaf los lee con th:errors).
            model.addAttribute("titulo", departamento.getId() == null ? "Nuevo Departamento" : "Editar Departamento");
            model.addAttribute("seccion", "departamentos");
            model.addAttribute("contenido", "departamentos/formulario :: contenido");
            return "layout";
        }

        boolean esNuevo = departamento.getId() == null;
        departamentoService.guardar(departamento);

        // RedirectAttributes + addFlashAttribute permite pasar un mensaje que
        // sobrevive a la redireccion (se guarda en la sesion por una sola peticion).
        // Esto nos permite mostrar un alert de Bootstrap personalizado en vez del
        // dialogo nativo del navegador.
        redirectAttributes.addFlashAttribute("mensajeExito",
                esNuevo ? "Departamento creado exitosamente." : "Departamento actualizado exitosamente.");

        return "redirect:/departamentos";
    }

    // GET /departamentos/eliminar/{id}
    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            departamentoService.eliminar(id);
            redirectAttributes.addFlashAttribute("mensajeExito", "Departamento eliminado exitosamente.");
        } catch (DataIntegrityViolationException ex) {
            // Esta excepcion ocurre cuando el departamento tiene empleados asociados
            // (la FK departamento_id en empleados impide el DELETE). En vez de mostrar
            // el error crudo de MariaDB, mostramos un mensaje amigable.
            redirectAttributes.addFlashAttribute("mensajeError",
                    "No se puede eliminar el departamento porque tiene empleados asociados. " +
                    "Reasigna o elimina esos empleados primero.");
        }
        return "redirect:/departamentos";
    }
}
