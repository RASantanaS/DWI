import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int suma = 0;

        System.out.println("Ingresa 10 números:");
        for (int i = 0; i < 10; i++) {
            System.out.print("Número " + (i + 1) + ": ");
            int numero = scanner.nextInt();
            suma = suma + numero;
        }

        double promedio = (double) suma / 10;

        System.out.println("La suma total es: " + suma);
        System.out.println("El promedio aritmético es: " + promedio);
    }
}