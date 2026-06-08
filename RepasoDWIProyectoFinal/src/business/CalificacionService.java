package business;

import data.FileDataManager;
import data.IGestorDatos;
import model.Estudiante;
import java.util.*;

public class CalificacionService {

    private final IGestorDatos<Estudiante> datos = new FileDataManager();

    public boolean registrar(Estudiante e) {
        return datos.registrar(e);
    }

    public List<Estudiante> buscarPorMesCurso(String mes, String curso) {
        List<Estudiante> resultado = new ArrayList<>();
        for (Estudiante e : datos.leerTodos()) {
            if (e.getMes().equalsIgnoreCase(mes) && e.getCurso().equalsIgnoreCase(curso))
                resultado.add(e);
        }
        Collections.sort(resultado); // orden natural: por apellido
        return resultado;
    }
}
