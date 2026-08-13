package com.empresa.sistema_inventario.controller;

import com.empresa.sistema_inventario.entity.Categoria;
import com.empresa.sistema_inventario.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // GET /categorias -> lista todas las categorias
    @GetMapping
    public String listar(Model model) {
        model.addAttribute("categorias", categoriaService.listarTodas());
        model.addAttribute("titulo", "Categorías");
        model.addAttribute("seccion", "categorias");
        model.addAttribute("contenido", "categorias/lista :: contenido");
        return "layout";
    }

    // GET /categorias/nueva -> muestra formulario vacio para crear
    @GetMapping("/nueva")
    public String mostrarFormularioNueva(Model model) {
        model.addAttribute("categoria", new Categoria());
        model.addAttribute("titulo", "Nueva Categoría");
        model.addAttribute("seccion", "categorias");
        model.addAttribute("contenido", "categorias/formulario :: contenido");
        return "layout";
    }

    // GET /categorias/editar/{id} -> muestra formulario con datos existentes
    @GetMapping("/editar/{id}")
    public String mostrarFormularioEditar(@PathVariable Long id, Model model) {
        model.addAttribute("categoria", categoriaService.buscarPorId(id));
        model.addAttribute("titulo", "Editar Categoría");
        model.addAttribute("seccion", "categorias");
        model.addAttribute("contenido", "categorias/formulario :: contenido");
        return "layout";
    }

    // POST /categorias/guardar -> procesa tanto creacion como edicion
    // @Valid activa las validaciones definidas en la entidad (@NotBlank, etc.)
    // BindingResult debe ir INMEDIATAMENTE despues del objeto @Valid, y captura
    // los errores de validacion en vez de lanzar una excepcion.
    @PostMapping("/guardar")
    public String guardar(@Valid @ModelAttribute("categoria") Categoria categoria,
                           BindingResult bindingResult,
                           Model model,
                           RedirectAttributes redirectAttributes) {

        if (bindingResult.hasErrors()) {
            // Si hay errores de validacion, regresamos al mismo formulario
            // mostrando los mensajes (Thymeleaf los lee con th:errors).
            model.addAttribute("titulo", categoria.getId() == null ? "Nueva Categoría" : "Editar Categoría");
            model.addAttribute("seccion", "categorias");
            model.addAttribute("contenido", "categorias/formulario :: contenido");
            return "layout";
        }

        boolean esNueva = categoria.getId() == null;
        categoriaService.guardar(categoria);

        // RedirectAttributes + addFlashAttribute permite pasar un mensaje que
        // sobrevive a la redireccion (se guarda en la sesion por una sola peticion).
        // Esto nos permite mostrar un alert de Bootstrap personalizado en vez del
        // dialogo nativo del navegador.
        redirectAttributes.addFlashAttribute("mensajeExito",
                esNueva ? "Categoria creada exitosamente." : "Categoria actualizada exitosamente.");

        return "redirect:/categorias";
    }

    // GET /categorias/eliminar/{id}
    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            categoriaService.eliminar(id);
            redirectAttributes.addFlashAttribute("mensajeExito", "Categoria eliminada exitosamente.");
        } catch (DataIntegrityViolationException ex) {
            // Esta excepcion ocurre cuando la categoria tiene productos asociados
            // (la FK categoria_id en productos impide el DELETE). En vez de mostrar
            // el error crudo de MariaDB, mostramos un mensaje amigable.
            redirectAttributes.addFlashAttribute("mensajeError",
                    "No se puede eliminar la categoria porque tiene productos asociados. " +
                    "Reasigna o elimina esos productos primero.");
        }
        return "redirect:/categorias";
    }
}
