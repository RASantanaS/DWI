import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Ejercicio 1");

        Scanner sc = new Scanner(System.in);

        System.out.println("Recolección de Datos 1");
        System.out.print("Nombre del perro: ");
        String nombreP = sc.nextLine();
        System.out.print("Raza: ");
        String razaP = sc.nextLine();
        System.out.print("Tipo de Animal: ");
        String tipoP = sc.nextLine();
        System.out.print("Fecha de Nacimiento: ");
        String fechaP = sc.nextLine();
        System.out.print("Lugar de Entrenamiento: ");
        String lugarP = sc.nextLine();
        System.out.print("Peso: ");
        float pesoP = sc.nextFloat();
        sc.nextLine();

        Perro miPerro = new Perro(nombreP, razaP, tipoP, fechaP, pesoP, lugarP);

        System.out.println("\nRecolección de Datos 2");
        System.out.print("Nombre del gato: ");
        String nombreG = sc.nextLine();
        System.out.print("Raza: ");
        String razaG = sc.nextLine();
        System.out.print("Tipo de Animal: ");
        String tipoG = sc.nextLine();
        System.out.print("Fecha de Nacimiento: ");
        String fechaG = sc.nextLine();
        System.out.print("Peso: ");
        float pesoG = sc.nextFloat();
        System.out.print("Altura de salto: ");
        double alturaG = sc.nextDouble();
        sc.nextLine();
        System.out.println();

        Gato miGato = new Gato(nombreG, razaG, tipoG, fechaG, pesoG, alturaG);

        System.out.println("Perro: ");
        miPerro.tipoAnimal();
        miPerro.comer();
        miPerro.comunicarse();
        System.out.println();

        System.out.println("Gato: ");
        miGato.tipoAnimal();
        miGato.comer();
        miGato.comunicarse();

        sc.close();
    }
}