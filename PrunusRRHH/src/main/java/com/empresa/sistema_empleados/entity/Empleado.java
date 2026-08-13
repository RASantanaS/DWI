package com.empresa.sistema_empleados.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "empleados")
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La cedula es obligatoria")
    @Column(nullable = false, unique = true, length = 20)
    private String cedula;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es valido")
    @Column(nullable = false)
    private String email;

    @NotBlank(message = "El telefono es obligatorio")
    @Column(length = 20)
    private String telefono;

    @NotBlank(message = "El cargo es obligatorio")
    @Column(length = 100)
    private String cargo;

    @NotNull(message = "El salario es obligatorio")
    @PositiveOrZero(message = "El salario no puede ser negativo")
    @Column(nullable = false)
    private Double salario;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(nullable = false)
    private boolean activo = true;

    // Lado "muchos" de la relacion: muchos empleados pertenecen a un departamento.
    // @ManyToOne + @JoinColumn crea la columna departamento_id (FK) en la tabla empleados.
    // FetchType.LAZY: el departamento solo se carga de la BD cuando realmente se
    // accede a el (mejor rendimiento que EAGER, que lo trae siempre aunque no se use).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id", nullable = false)
    @NotNull(message = "Debe seleccionar un departamento")
    private Departamento departamento;

    public Empleado() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public Double getSalario() {
        return salario;
    }

    public void setSalario(Double salario) {
        this.salario = salario;
    }

    public LocalDate getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(LocalDate fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public Departamento getDepartamento() {
        return departamento;
    }

    public void setDepartamento(Departamento departamento) {
        this.departamento = departamento;
    }
}
