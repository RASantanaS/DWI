import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("-> Ingreso de Datos del Perro <-");
        System.out.print("Nombre: ");
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

        System.out.println("\n-> Ingreso de Datos del Gato <-");
        System.out.print("Nombre: ");
        String nombreG = sc.nextLine();
        System.out.print("Raza: ");
        String razaG = sc.nextLine();
        System.out.print("Tipo de Animal: ");
        String tipoG = sc.nextLine();
        System.out.print("Fecha de Nacimiento: ");
        String fechaG = sc.nextLine();
        System.out.print("Peso: ");
        float pesoG = sc.nextFloat();
        System.out.print("Altura de Salto (decimal): ");
        double alturaG = sc.nextDouble();

        Gato miGato = new Gato(nombreG, razaG, tipoG, fechaG, pesoG, alturaG);

        System.out.println("\n> Resultados de Comunicacion <");
        System.out.print(miPerro.nombre + " (Perro) dice: ");
        miPerro.comunicarse();

        System.out.print(miGato.nombre + " (Gato) dice: ");
        miGato.comunicarse();

        sc.close();
    }
}