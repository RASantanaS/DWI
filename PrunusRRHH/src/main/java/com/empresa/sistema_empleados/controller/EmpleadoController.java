package com.empresa.sistema_empleados.controller;

import com.empresa.sistema_empleados.entity.Departamento;
import com.empresa.sistema_empleados.entity.Empleado;
import com.empresa.sistema_empleados.service.DepartamentoService;
import com.empresa.sistema_empleados.service.EmpleadoService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/empleados")
public class EmpleadoController {

    private final EmpleadoService empleadoService;
    private final DepartamentoService departamentoService;

    public EmpleadoController(EmpleadoService empleadoService, DepartamentoService departamentoService) {
        this.empleadoService = empleadoService;
        this.departamentoService = departamentoService;
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("empleados", empleadoService.listarTodos());
        // Se envia para que la vista pueda deshabilitar el boton "Nuevo empleado"
        // si todavia no existe ningun departamento.
        model.addAttribute("hayDepartamentos", !departamentoService.listarTodos().isEmpty());
        model.addAttribute("titulo", "Empleados");
        model.addAttribute("seccion", "empleados");
        model.addAttribute("contenido", "empleados/lista :: contenido");
        return "layout";
    }

    @GetMapping("/nuevo")
    public String mostrarFormularioNuevo(Model model, RedirectAttributes redirectAttributes) {
        List<Departamento> departamentos = departamentoService.listarTodos();

        // No se puede crear un empleado sin departamentos: el <select> quedaria vacio
        // y el campo "departamento" es obligatorio (@NotNull), asi que el formulario
        // nunca podria enviarse con exito. En vez de dejar al usuario en un
        // formulario roto, lo mandamos a crear un departamento primero.
        if (departamentos.isEmpty()) {
            redirectAttributes.addFlashAttribute("mensajeError",
                    "Debes crear al menos un departamento antes de registrar un empleado.");
            return "redirect:/departamentos/nuevo";
        }

        Empleado empleado = new Empleado();
        empleado.setActivo(true);

        model.addAttribute("empleado", empleado);
        model.addAttribute("departamentos", departamentos);
        model.addAttribute("titulo", "Nuevo Empleado");
        model.addAttribute("seccion", "empleados");
        model.addAttribute("contenido", "empleados/formulario :: contenido");
        return "layout";
    }

    @GetMapping("/editar/{id}")
    public String mostrarFormularioEditar(@PathVariable Long id, Model model) {
        model.addAttribute("empleado", empleadoService.buscarPorId(id));
        model.addAttribute("departamentos", departamentoService.listarTodos());
        model.addAttribute("titulo", "Editar Empleado");
        model.addAttribute("seccion", "empleados");
        model.addAttribute("contenido", "empleados/formulario :: contenido");
        return "layout";
    }

    // GET /empleados/ver/{id} -> muestra el detalle de un empleado en modo lectura
    @GetMapping("/ver/{id}")
    public String ver(@PathVariable Long id, Model model) {
        model.addAttribute("empleado", empleadoService.buscarPorId(id));
        model.addAttribute("titulo", "Detalle del Empleado");
        model.addAttribute("seccion", "empleados");
        model.addAttribute("contenido", "empleados/ver :: contenido");
        return "layout";
    }

    @PostMapping("/guardar")
    public String guardar(@Valid @ModelAttribute("empleado") Empleado empleado,
                           BindingResult bindingResult,
                           Model model,
                           RedirectAttributes redirectAttributes) {

        if (bindingResult.hasErrors()) {
            // Si regresamos al formulario por errores, hay que volver a cargar
            // la lista de departamentos, porque el Model no persiste entre peticiones.
            model.addAttribute("departamentos", departamentoService.listarTodos());
            model.addAttribute("titulo", empleado.getId() == null ? "Nuevo Empleado" : "Editar Empleado");
            model.addAttribute("seccion", "empleados");
            model.addAttribute("contenido", "empleados/formulario :: contenido");
            return "layout";
        }

        boolean esNuevo = empleado.getId() == null;
        empleadoService.guardar(empleado);

        redirectAttributes.addFlashAttribute("mensajeExito",
                esNuevo ? "Empleado creado exitosamente." : "Empleado actualizado exitosamente.");

        return "redirect:/empleados";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        empleadoService.eliminar(id);
        redirectAttributes.addFlashAttribute("mensajeExito", "Empleado eliminado exitosamente.");
        return "redirect:/empleados";
    }
}
