public abstract class Mamiferos {
    protected String nombre;
    protected String raza;
    protected String tipoAnimal;
    protected String fechaNacimiento;
    protected float peso;

    public Mamiferos(String nombre, String raza, String tipoAnimal, String fechaNacimiento, float peso) {
        this.nombre = nombre;
        this.raza = raza;
        this.tipoAnimal = tipoAnimal;
        this.fechaNacimiento = fechaNacimiento;
        this.peso = peso;
    }

    public void comer() {
        System.out.println(nombre + " está comiendo.");
    }

    public void tipoAnimal() {
        System.out.println(nombre + " es un " + tipoAnimal + ".");
    }

    public abstract void comunicarse();
}