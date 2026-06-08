package model;

public abstract class Persona {
    protected String nombre;
    protected String apellido;

    public Persona(String nombre, String apellido) {
        this.nombre   = nombre  != null ? nombre.trim()  : "";
        this.apellido = apellido != null ? apellido.trim() : "";
    }

    public String getNombre()   { return nombre; }
    public String getApellido() { return apellido; }
}
