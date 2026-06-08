import java.util.Scanner;

public class LectorDatos {

    private static final Scanner sc = new Scanner(System.in);

    // Lee un entero en [min, max]. Si el usuario ingresa texto, repite hasta obtener uno valido.
    public static int leerEntero(String prompt, int min, int max) {
        while (true) {
            System.out.print(prompt);
            try {
                String linea = sc.nextLine().trim();
                // Senal ESC: si el usuario presiona ESC
                if (!linea.isEmpty() && linea.charAt(0) == 27) return -1;

                int valor = Integer.parseInt(linea);
                if (valor >= min && valor <= max) return valor;

                System.out.printf("  [AVISO] Ingrese un numero entre %d y %d.%n", min, max);
            } catch (NumberFormatException e) {
                System.out.println("  [AVISO] Se esperaba un numero. Intente de nuevo.");
            }
        }
    }

    // Lee texto no vacio.
    public static String leerTexto(String prompt) {
        while (true) {
            System.out.print(prompt);
            String valor = sc.nextLine().trim();
            if (!valor.isEmpty()) return valor;
            System.out.println("  [AVISO] Este campo no puede estar vacio.");
        }
    }

    // Lee nota de asignatura (0-100).
    public static double leerNota(String asignatura) {
        return leerEntero("    " + asignatura + " [0-100]: ", 0, 100);
    }

    // Lee linea cruda (para el menu, sin validaciones).
    public static String leerLinea() {
        try { return sc.nextLine(); } catch (Exception e) { return ""; }
    }

    public static void cerrar() { sc.close(); }
}