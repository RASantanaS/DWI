package data;

import model.Estudiante;
import java.io.*;
import java.util.*;

public class FileDataManager implements IGestorDatos<Estudiante> {

    private static final String ARCHIVO = "calificaciones.txt";

    @Override
    public boolean registrar(Estudiante e) {
        try {
            BufferedWriter bw = new BufferedWriter(new FileWriter(ARCHIVO, true));
            bw.write(e.serializar());
            bw.newLine();
            bw.close();
            return true;
        } catch (IOException ex) {
            System.out.println("  Error al guardar: " + ex.getMessage());
            return false;
        }
    }

    @Override
    public List<Estudiante> leerTodos() {
        List<Estudiante> lista = new ArrayList<>();

        File archivo = new File(ARCHIVO);
        if (!archivo.exists()) return lista;

        try {
            BufferedReader br = new BufferedReader(new FileReader(archivo));
            String linea;
            int numLinea = 0;

            while ((linea = br.readLine()) != null) {
                numLinea++;
                linea = linea.trim();
                if (linea.isEmpty()) continue;

                String[] partes = linea.split("\\|");
                if (partes.length < 8) {
                    System.out.println("  Línea " + numLinea + " incompleta, se omite.");
                    continue;
                }

                try {
                    Estudiante e = new Estudiante(
                            partes[0], partes[1],
                            Double.parseDouble(partes[2]),
                            Double.parseDouble(partes[3]),
                            Double.parseDouble(partes[4]),
                            Double.parseDouble(partes[5]),
                            partes[6], partes[7]
                    );
                    lista.add(e);
                } catch (NumberFormatException ex) {
                    System.out.println("  Línea " + numLinea + " con nota inválida, se omite.");
                }
            }
            br.close();

        } catch (IOException ex) {
            System.out.println("  Error al leer el archivo: " + ex.getMessage());
        }

        return lista;
    }

    @Override public boolean actualizar(String id, Estudiante e) { return false; }
    @Override public boolean eliminar(String id)                  { return false; }
}
