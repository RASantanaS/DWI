public class Perro extends Mamifero {
    String lugarEntrenamiento;

    public Perro(String nombre, String raza, String fechaNacimiento, float peso, String lugarEntrenamiento) {
        super(nombre, raza, fechaNacimiento, peso);
        this.lugarEntrenamiento = lugarEntrenamiento;
    }

    @Override
    public void mostrarDatos() {
        super.mostrarDatos();
        System.out.println("Lugar de entrenamiento: " + lugarEntrenamiento);
    }

    @Override
    public void comer() {
        System.out.println(nombre + " (Perro) esta comiendo.");
    }

    @Override
    public void comunicarse() {
        System.out.println(nombre + " dice: guau guau");
    }
}