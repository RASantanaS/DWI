package com.empresa.sistema_inventario.controller;

import com.empresa.sistema_inventario.entity.Categoria;
import com.empresa.sistema_inventario.entity.Producto;
import com.empresa.sistema_inventario.service.CategoriaService;
import com.empresa.sistema_inventario.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;
    private final CategoriaService categoriaService;

    public ProductoController(ProductoService productoService, CategoriaService categoriaService) {
        this.productoService = productoService;
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("productos", productoService.listarTodos());
        model.addAttribute("hayCategorias", !categoriaService.listarTodas().isEmpty());
        model.addAttribute("titulo", "Productos");
        model.addAttribute("seccion", "productos");
        model.addAttribute("contenido", "productos/lista :: contenido");
        return "layout";
    }

    @GetMapping("/nuevo")
    public String mostrarFormularioNuevo(Model model, RedirectAttributes redirectAttributes) {
        List<Categoria> categorias = categoriaService.listarTodas();

        if (categorias.isEmpty()) {
            redirectAttributes.addFlashAttribute("mensajeError",
                    "Debes crear al menos una categoría antes de registrar un producto.");
            return "redirect:/categorias/nueva";
        }

        model.addAttribute("producto", new Producto());
        model.addAttribute("categorias", categorias);
        model.addAttribute("titulo", "Nuevo Producto");
        model.addAttribute("seccion", "productos");
        model.addAttribute("contenido", "productos/formulario :: contenido");
        return "layout";
    }

    @GetMapping("/editar/{id}")
    public String mostrarFormularioEditar(@PathVariable Long id, Model model) {
        model.addAttribute("producto", productoService.buscarPorId(id));
        model.addAttribute("categorias", categoriaService.listarTodas());
        model.addAttribute("titulo", "Editar Producto");
        model.addAttribute("seccion", "productos");
        model.addAttribute("contenido", "productos/formulario :: contenido");
        return "layout";
    }

    @PostMapping("/guardar")
    public String guardar(@Valid @ModelAttribute("producto") Producto producto,
                           BindingResult bindingResult,
                           Model model,
                           RedirectAttributes redirectAttributes) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("categorias", categoriaService.listarTodas());
            model.addAttribute("titulo", producto.getId() == null ? "Nuevo Producto" : "Editar Producto");
            model.addAttribute("seccion", "productos");
            model.addAttribute("contenido", "productos/formulario :: contenido");
            return "layout";
        }

        boolean esNuevo = producto.getId() == null;
        productoService.guardar(producto);

        redirectAttributes.addFlashAttribute("mensajeExito",
                esNuevo ? "Producto creado exitosamente." : "Producto actualizado exitosamente.");

        return "redirect:/productos";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        productoService.eliminar(id);
        redirectAttributes.addFlashAttribute("mensajeExito", "Producto eliminado exitosamente.");
        return "redirect:/productos";
    }
}
