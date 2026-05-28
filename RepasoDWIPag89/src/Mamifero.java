public class Mamifero {
    String nombre;
    String raza;
    String fechaNacimiento;
    float peso;

    public Mamifero(String nombre, String raza, String fechaNacimiento, float peso) {
        this.nombre = nombre;
        this.raza = raza;
        this.fechaNacimiento = fechaNacimiento;
        this.peso = peso;
    }

    public void mostrarDatos() {
        System.out.println("Información de: " + nombre);
        System.out.println("Raza: " + raza);
        System.out.println("Fecha de Nacimiento: " + fechaNacimiento);
        System.out.println("Peso: " + peso + " kg");
    }

    public void comer() {
        System.out.println(nombre + " esta comiendo.");
    }

    public void comunicarse() {
        System.out.println("El mamifero hace un sonido");
    }
}