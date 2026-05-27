import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int[] numeros = new int[10];

        System.out.println("Ingresa 10 números:");
        for (int i = 0; i < 10; i++) {
            System.out.print("Número " + (i + 1) + ": ");
            numeros[i] = scanner.nextInt();
        }

        System.out.print("Ingresa el divisor: ");
        int divisor = scanner.nextInt();

        boolean encontroMultiplo = false;

        for (int i = 0; i < 10; i++) {
            if (numeros[i] % divisor == 0) {
                System.out.println(numeros[i]);
                encontroMultiplo = true;
            }
        }

        if (!encontroMultiplo) {
            System.out.println("Ninguno de los números fue múltiplo del divisor");
        }
    }
}