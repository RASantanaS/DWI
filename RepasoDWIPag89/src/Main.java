import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        try {
            System.out.println(">Datos del Perro<");
            System.out.print("Nombre: ");
            String nombrePerro = scanner.nextLine();
            System.out.print("Raza: ");
            String razaPerro = scanner.nextLine();
            System.out.print("Fecha de Nacimiento: ");
            String fechaPerro = scanner.nextLine();
            System.out.print("Peso: ");
            float pesoPerro = Float.parseFloat(scanner.nextLine());
            System.out.print("Lugar de entrenamiento: ");
            String lugar = scanner.nextLine();

            Perro miPerro = new Perro(nombrePerro, razaPerro, fechaPerro, pesoPerro, lugar);
            System.out.println();
            miPerro.mostrarDatos();
            miPerro.comer();
            miPerro.comunicarse();

            System.out.println("\n>Datos del Gato<");
            System.out.print("Nombre: ");
            String nombreGato = scanner.nextLine();
            System.out.print("Raza: ");
            String razaGato = scanner.nextLine();
            System.out.print("Fecha de Nacimiento: ");
            String fechaGato = scanner.nextLine();
            System.out.print("Peso: ");
            float pesoGato = Float.parseFloat(scanner.nextLine());
            System.out.print("Altura de salto: ");
            double alturaSalto = Double.parseDouble(scanner.nextLine());

            Gato miGato = new Gato(nombreGato, razaGato, fechaGato, pesoGato, alturaSalto);
            System.out.println();
            miGato.mostrarDatos();
            miGato.comer();
            miGato.comunicarse();

        } catch (NumberFormatException e) {
            System.out.println("Error: ingresa un numero valido.");
        } finally {
            scanner.close();
        }
    }
}