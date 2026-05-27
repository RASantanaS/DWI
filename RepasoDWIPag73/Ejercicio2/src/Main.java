import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        int mayor = 0;
        int menor = 0;

        System.out.println("Ingresa 10 números:");
        for (int i = 0; i < 10; i++) {
            System.out.print("Número " + (i + 1) + ": ");
            int numero = scanner.nextInt();

            if (i == 0) {
                mayor = numero;
                menor = numero;
            } else {
                if (numero > mayor) {
                    mayor = numero;
                }
                if (numero < menor) {
                    menor = numero;
                }
            }
        }

        System.out.println("El número mayor es: " + mayor);
        System.out.println("El número menor es: " + menor);
    }
}
