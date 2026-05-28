public class Gato extends Mamifero {
    double alturaSalto;

    public Gato(String nombre, String raza, String fechaNacimiento, float peso, double alturaSalto) {
        super(nombre, raza, fechaNacimiento, peso);
        this.alturaSalto = alturaSalto;
    }
    @Override
    public void mostrarDatos() {
        super.mostrarDatos();
        System.out.println("Altura de Salto: " + alturaSalto + " mts.");
    }

    @Override
    public void comer() {
        System.out.println(nombre + " (Gato) esta comiendo.");
    }

    @Override
    public void comunicarse() {
        System.out.println(nombre + " dice: miau miau");
    }
}