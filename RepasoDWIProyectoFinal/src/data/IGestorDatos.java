package data;

import java.util.List;

public interface IGestorDatos<T> {
    boolean  registrar(T entidad);
    List<T>  leerTodos();
    boolean  actualizar(String id, T entidad);  // reservado para versiones futuras
    boolean  eliminar(String id);               // reservado para versiones futuras
}
