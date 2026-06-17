package data;

import model.Estudiante;

import java.io.*;
import java.util.*;

public class FileDataManager {

    private static final String DIRECTORIO = "calificaciones";

    public FileDataManager() {
        new File(DIRECTORIO).mkdirs();
    }

    private String obtenerRuta(String curso) {
        return DIRECTORIO + File.separator + "cal_curso_" + curso + ".txt";
    }

    public boolean registrar(Estudiante e) {
        try {
            BufferedWriter bw = new BufferedWriter(new FileWriter(obtenerRuta(e.getCurso()), true));
            bw.write(e.serializar());
            bw.newLine();
            bw.close();
            return true;
        } catch (IOException ex) {
            System.out.println("  [ERROR] No se pudo guardar: " + ex.getMessage());
            return false;
        }
    }

    public List<Estudiante> leerPorMesCurso(String mes, String curso) {
        List<Estudiante> todosLosDelCurso = leerArchivo(new File(obtenerRuta(curso)));
        List<Estudiante> filtradosPorMes = new ArrayList<>();

        for (Estudiante e : todosLosDelCurso) {
            if (e.getMes().equalsIgnoreCase(mes)) {
                filtradosPorMes.add(e);
            }
        }
        return filtradosPorMes;
    }

    private List<Estudiante> leerArchivo(File archivo) {
        List<Estudiante> lista = new ArrayList<>();
        if (!archivo.exists()) return lista;
        try {
            BufferedReader br = new BufferedReader(new FileReader(archivo));
            String linea;
            while ((linea = br.readLine()) != null) {
                linea = linea.trim();
                if (linea.isEmpty()) continue;
                Estudiante e = parsear(linea);
                if (e != null) lista.add(e);
            }
            br.close();
        } catch (IOException ex) {
            System.out.println("  [ERROR] No se pudo leer " + archivo.getName());
        }
        return lista;
    }

    private Estudiante parsear(String linea) {
        String[] p = linea.split(",");
        if (p.length < 8) return null;
        try {
            return new Estudiante(p[0], p[1],
                    Double.parseDouble(p[2]), Double.parseDouble(p[3]),
                    Double.parseDouble(p[4]), Double.parseDouble(p[5]),
                    p[6], p[7]);
        } catch (NumberFormatException ex) {
            System.out.println("  [!] Linea con formato incorrecto omitida.");
            return null;
        }
    }
}