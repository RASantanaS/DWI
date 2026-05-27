import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int[] arreglo = new int[10];

        System.out.println("Ingresa 10 números para llenar el arreglo:");
        for (int i = 0; i < 10; i++) {
            System.out.print("Posición " + i + ": ");
            arreglo[i] = scanner.nextInt();
        }

        System.out.print("Ingresa el número que deseas buscar: ");
        int buscar = scanner.nextInt();

        boolean encontrado = false;

        for (int i = 0; i < 10; i++) {
            if (arreglo[i] == buscar) {
                System.out.println("¡Número encontrado! Está en la posición/índice " + i + " del arreglo.");
                encontrado = true;
            }
        }

        if (!encontrado) {
            System.out.println("El número " + buscar + " no se encuentra en el arreglo.");
        }
    }
}