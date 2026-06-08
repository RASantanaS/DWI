import business.CalificacionService;
import model.Estudiante;
import java.util.List;

public class Main {

    static final String SEP = "==============================================================";
    static final CalificacionService servicio = new CalificacionService();

    public static void main(String[] args) {
        System.out.println("\n  Bienvenido - Colegio \"Dios es Bueno\"\n");
        menuPrincipal();
        LectorDatos.cerrar();
        System.out.println("\n  Hasta luego.\n");
    }

    // ── Menu ──────────────────────────────────────────────────────────────

    static void menuPrincipal() {
        while (true) {
            imprimirMenu();
            String entrada = LectorDatos.leerLinea();

            // ESC directo (ASCII 27)
            if (!entrada.isEmpty() && entrada.charAt(0) == 27) return;

            switch (entrada.trim()) {
                case "1" -> registro();
                case "2" -> reporte();
                case "3" -> { if (confirmarSalida()) return; }
                default  -> System.out.println("  [AVISO] Opcion invalida. Elija 1, 2 o 3.\n");
            }
        }
    }

    static void imprimirMenu() {
        System.out.println(SEP);
        System.out.println("         COLEGIO DIOS ES BUENO");
        System.out.println("        SISTEMA DE CALIFICACIONES");
        System.out.println(SEP);
        System.out.println("   1 -  Registro de calificaciones");
        System.out.println("   2 -  Reporte calificaciones por mes");
        System.out.println("   3 -  Presione <ESC> para salir");
        System.out.println(SEP);
        System.out.print("  Elija la opcion y pulse <ENTER>:  ");
    }

    // ── Registro ──────────────────────────────────────────────────────────

    static void registro() {
        System.out.println("\n" + SEP);
        System.out.println("        REGISTRO DE CALIFICACIONES");
        System.out.println(SEP);

        String nombre   = LectorDatos.leerTexto("  Nombre   : ");
        String apellido = LectorDatos.leerTexto("  Apellido : ");
        String mes      = LectorDatos.leerTexto("  Mes      : ");
        String curso    = LectorDatos.leerTexto("  Curso    : ");

        System.out.println("\n  Calificaciones (0 - 100):");
        double mat = LectorDatos.leerNota("Matematica");
        double len = LectorDatos.leerNota("Lengua    ");
        double nat = LectorDatos.leerNota("Naturales ");
        double soc = LectorDatos.leerNota("Sociales  ");

        boolean ok = servicio.registrar(
                new Estudiante(nombre, apellido, mat, len, nat, soc, mes, curso)
        );

        System.out.println(ok ? "\n  [OK] Guardado exitosamente." : "\n  [ERROR] Error al guardar.");
        pausa();
    }

    // ── Reporte ───────────────────────────────────────────────────────────

    static void reporte() {
        System.out.println("\n" + SEP);
        String mes   = LectorDatos.leerTexto("  Mes   (ej: Enero) : ");
        String curso = LectorDatos.leerTexto("  Curso (ej: 1B)    : ");

        List<Estudiante> lista = servicio.buscarPorMesCurso(mes, curso);

        System.out.println("\n" + SEP);
        System.out.println("           Colegio Dios es Bueno");
        System.out.printf ("     Reporte de Calificaciones de %s%n", capitalizar(mes));
        System.out.printf ("               Curso: %s%n", curso.toUpperCase());
        System.out.println(SEP);

        if (lista.isEmpty()) {
            System.out.println("  Sin registros para ese mes y curso.");
            pausa();
            return;
        }

        System.out.printf("%-13s %-13s %10s %7s %10s %8s %9s  %s%n",
                "Nombre", "Apellido", "Matematica", "Lengua", "Naturales", "Sociales", "Promedio", "Literal");
        System.out.println("-".repeat(62));

        int total = 0;
        for (Estudiante e : lista) {
            try {
                System.out.printf("%-13s %-13s %10.0f %7.0f %10.0f %8.0f %9.2f  %s%n",
                        e.getNombre(), e.getApellido(),
                        e.getMatematica(), e.getLengua(), e.getNaturales(), e.getSociales(),
                        e.getPromedio(), e.getLiteral());
                total++;
            } catch (ArithmeticException ex) {
                System.out.printf("  [AVISO] Registro dañado (%s %s) - omitido.%n",
                        e.getNombre(), e.getApellido());
            }
        }

        System.out.println("-".repeat(62));
        System.out.printf("  Total de estudiantes: %d%n", total);
        System.out.println(SEP);
        pausa();
    }

    // ── Utilidades ────────────────────────────────────────────────────────

    static boolean confirmarSalida() {
        System.out.print("\n  Confirme con [ESC]+ENTER o escriba 'S'+ENTER para salir: ");
        String r = LectorDatos.leerLinea().trim();
        return !r.isEmpty() && (r.charAt(0) == 27 || r.equalsIgnoreCase("S"));
    }

    static void pausa() {
        System.out.print("\n  Presione ENTER para continuar...");
        LectorDatos.leerLinea();
        System.out.println();
    }

    static String capitalizar(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }
}