package com.empresa.sistema_empleados.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

// @Entity marca esta clase como una tabla en la base de datos.
// @Table permite especificar el nombre de la tabla explicitamente.
@Entity
@Table(name = "departamentos")
public class Departamento {

    // @Id marca el campo como clave primaria.
    // @GeneratedValue con estrategia IDENTITY delega en MariaDB el autoincremento.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del departamento es obligatorio")
    @Column(nullable = false, unique = true)
    private String nombre;

    // Lado "uno" de la relacion Many-to-One (un departamento tiene muchos empleados).
    // mappedBy indica que la relacion es controlada por el campo "departamento" en Empleado.
    // Sin cascade de borrado: si el departamento tiene empleados, el DELETE debe
    // fallar por la FK (departamento_id NOT NULL en empleados), y esa excepcion
    // se captura en el Controller para mostrar un mensaje amigable.
    @OneToMany(mappedBy = "departamento", cascade = CascadeType.PERSIST)
    private List<Empleado> empleados = new ArrayList<>();

    public Departamento() {
    }

    public Departamento(String nombre) {
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<Empleado> getEmpleados() {
        return empleados;
    }

    public void setEmpleados(List<Empleado> empleados) {
        this.empleados = empleados;
    }

    // equals/hashCode basados en el id: Thymeleaf los usa para comparar el valor
    // de cada <option> del select con el objeto departamento del empleado, y asi
    // saber cual opcion marcar como "selected" al editar un empleado existente.
    // Sin esto (con el equals por defecto de Object, que compara referencias),
    // el select siempre se mostraria vacio al editar.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Departamento)) return false;
        Departamento departamento = (Departamento) o;
        return id != null && id.equals(departamento.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
