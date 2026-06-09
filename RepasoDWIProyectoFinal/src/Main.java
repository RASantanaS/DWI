import data.FileDataManager;
import model.Estudiante;
import java.util.*;

public class Main {

    static final Scanner sc = new Scanner(System.in);
    static final FileDataManager archivo = new FileDataManager();

    static final String LINEA = "=============================================================";
    static final String[] MESES = {
            "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    };

    public static void main(String[] args) {
        System.out.println("Bienvenido al Sistema de Calificaciones");
        System.out.println("Colegio Dios es Bueno\n");

        boolean ejecutando = true;

        while (ejecutando) {
            mostrarMenu();
            String entrada = leerLinea();

            if (entrada.isEmpty()) continue;
            if (entrada.charAt(0) == 27) break; // ESC directo

            switch (entrada.trim()) {
                case "1":
                    registrar();
                    break;
                case "2":
                    reporte();
                    break;
                case "3":
                    System.out.print("\n  Presione ESC + ENTER, o escriba S + ENTER para salir: ");
                    String r = leerLinea().trim();
                    if ((!r.isEmpty() && r.charAt(0) == 27) || r.equalsIgnoreCase("S")) {
                        ejecutando = false;
                    }
                    break;
                default:
                    System.out.println("\n  [AVISO] Opcion invalida. Elija 1, 2 o 3.\n");
                    break;
            }
        }

        System.out.println("\n  Hasta luego.\n");
        sc.close();
    }

    // ── Menu ──────────────────────────────────────────────────────────────

    static void mostrarMenu() {
        System.out.println(LINEA);
        System.out.println("         COLEGIO DIOS ES BUENO");
        System.out.println("        SISTEMA DE CALIFICACIONES");
        System.out.println(LINEA);
        System.out.println("   1 - Registro de calificaciones");
        System.out.println("   2 - Reporte calificaciones por mes");
        System.out.println("   3 - Presione <ESC> para salir");
        System.out.println(LINEA);
        System.out.print("  Elija la opcion y pulse <ENTER>: ");
    }

    // ── Registro ──────────────────────────────────────────────────────────

    static void registrar() {
        System.out.println("\n" + LINEA);
        System.out.println("       REGISTRO DE CALIFICACIONES");
        System.out.println(LINEA);

        String mes   = seleccionarMes();
        if (mes == null) return;
        String curso = leerTexto("  Curso (ej. 1A, 2B): ").toUpperCase();

        boolean continuar = true;
        while (continuar) {
            System.out.println("\n  -- Datos del estudiante --");
            String nombre   = leerTexto("  Nombre   : ");
            String apellido = leerTexto("  Apellido : ");

            System.out.println("\n  Calificaciones (0 - 100):");
            double matematica = leerNota("Matematica");
            double lengua     = leerNota("Lengua    ");
            double naturales  = leerNota("Naturales ");
            double sociales   = leerNota("Sociales  ");

            Estudiante e = new Estudiante(nombre, apellido,
                    matematica, lengua, naturales, sociales, mes, curso);

            if (archivo.registrar(e)) {
                System.out.printf("%n  [OK] Guardado. Promedio: %.1f  Literal: %s%n",
                        e.getPromedio(), e.getLiteral());
            } else {
                System.out.println("\n  [ERROR] No se pudo guardar.");
            }

            while (true) {
                System.out.print("\n  Agregar otro estudiante? (S/N): ");
                String r = leerLinea().trim().toUpperCase();

                if (r.equals("S")) {
                    continuar = true;
                    break;
                } else if (r.equals("N")) {
                    continuar = false;
                    break;
                } else {
                    System.out.println("  [AVISO] Opcion no reconocida, regresando al menú principal.");
                    continuar = false;
                    break;
                }
            }
        }
    }

    // ── Reporte ───────────────────────────────────────────────────────────

    static void reporte() {
        System.out.println("\n" + LINEA);
        System.out.println("       REPORTE DE CALIFICACIONES");
        System.out.println(LINEA);

        String mes   = seleccionarMes();
        if (mes == null) return;
        String curso = leerTexto("  Curso (ej. 1A, 2B): ").toUpperCase();

        List<Estudiante> lista = archivo.leerPorMesCurso(mes, curso);
        Collections.sort(lista); // ordena por apellido via Comparable

        System.out.println("\n" + LINEA);
        System.out.println("           Colegio Dios es Bueno");
        System.out.println("    Reporte de Calificaciones de " + mes);
        System.out.println("              Curso: " + curso);
        System.out.println(LINEA);

        if (lista.isEmpty()) {
            System.out.println("  Sin registros para " + mes + " - Curso " + curso + ".");
        } else {
            System.out.printf("%-13s %-13s %10s %7s %10s %8s %9s  %s%n",
                    "Nombre", "Apellido", "Matematica", "Lengua",
                    "Naturales", "Sociales", "Promedio", "Literal");
            System.out.println("-------------------------------------------------------------");

            int total = 0;
            for (Estudiante e : lista) {
                try {
                    System.out.printf("%-13s %-13s %10.0f %7.0f %10.0f %8.0f %9.2f  %s%n",
                            e.getNombre(), e.getApellido(),
                            e.getMatematica(), e.getLengua(),
                            e.getNaturales(),  e.getSociales(),
                            e.getPromedio(), e.getLiteral());
                    total++;
                } catch (ArithmeticException ex) {
                    System.out.println("  [AVISO] Registro danado (" + e.getNombre()
                            + " " + e.getApellido() + ") - omitido.");
                }
            }

            System.out.println("-------------------------------------------------------------");
            System.out.println("  Total de estudiantes: " + total);
        }

        System.out.println(LINEA);
        System.out.print("\n  Presione ENTER para continuar...");
        leerLinea();
        System.out.println();
    }

    // ── Utilidades ────────────────────────────────────────────────────────

    static String seleccionarMes() {
        System.out.println("\n  Seleccione el mes:");
        for (int i = 0; i < MESES.length; i++) {
            System.out.printf("    %2d - %s%n", i + 1, MESES[i]);
        }
        System.out.print("  Opcion (1-12): ");

        while (true) {
            String input = leerLinea().trim();
            try {
                int num = Integer.parseInt(input);
                if (num >= 1 && num <= 12) return MESES[num - 1];
                System.out.print("  [!] Ingrese un numero entre 1 y 12: ");
            } catch (NumberFormatException e) {
                System.out.print("  [!] Opcion no valida. Ingrese un numero (1-12): ");
            }
        }
    }

    static double leerNota(String asignatura) {
        while (true) {
            System.out.print("    " + asignatura + " [0-100]: ");
            try {
                int valor = Integer.parseInt(leerLinea().trim());
                if (valor >= 0 && valor <= 100) return valor;
                System.out.println("  [!] Ingrese un numero entre 0 y 100.");
            } catch (NumberFormatException e) {
                System.out.println("  [!] Entrada invalida. Se esperaba un numero.");
            }
        }
    }

    static String leerTexto(String prompt) {
        while (true) {
            System.out.print(prompt);
            String entrada = sc.nextLine().trim();
            if (!entrada.isEmpty()) return entrada;
            System.out.println("  [!] Este campo no puede estar vacio.");
        }
    }

    static String leerLinea() {
        try { return sc.nextLine(); } catch (Exception e) { return ""; }
    }
}
