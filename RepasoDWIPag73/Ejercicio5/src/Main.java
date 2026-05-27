import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int[][] matrizA = new int[3][3];
        int[][] matrizB = new int[3][3];

        System.out.println("Ingreso de Matriz A");
        leerMatriz(scanner, matrizA);

        System.out.println("Ingreso de Matriz B");
        leerMatriz(scanner, matrizB);

        System.out.print("Ingresa un número para multiplicar las matrices: ");
        int numero = scanner.nextInt();

        System.out.println("\nMatriz A multiplicada por " + numero + ":");
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                System.out.print((matrizA[i][j] * numero) + "\t");
            }
            System.out.println();
        }

        System.out.println("\nSuma de la Matriz A + Matriz B:");
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                System.out.print((matrizA[i][j] + matrizB[i][j]) + "\t");
            }
            System.out.println();
        }

        System.out.println("\nProducto de la Matriz A x Matriz B:");
        int[][] matrizProducto = new int[3][3];

        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                matrizProducto[i][j] = 0;
                for (int k = 0; k < 3; k++) {
                    matrizProducto[i][j] += matrizA[i][k] * matrizB[k][j];
                }
                System.out.print(matrizProducto[i][j] + "\t");
            }
            System.out.println();
        }
    }

    public static void leerMatriz(Scanner scanner, int[][] matriz) {
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                System.out.print("Fila " + i + " - Columna " + j + ": ");
                matriz[i][j] = scanner.nextInt();
            }
        }
    }
}