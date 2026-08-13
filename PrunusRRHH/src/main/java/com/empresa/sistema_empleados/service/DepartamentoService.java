package com.empresa.sistema_empleados.service;

import com.empresa.sistema_empleados.entity.Departamento;
import com.empresa.sistema_empleados.repository.DepartamentoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// @Service marca esta clase como un componente de la capa de negocio.
// Spring la detecta via @ComponentScan y la registra como un "bean" que puede
// ser inyectado en otras clases (como el Controller) usando @Autowired.
@Service
public class DepartamentoService {

    private final DepartamentoRepository departamentoRepository;

    // Inyeccion de dependencias por constructor (la forma recomendada).
    // Spring ve que esta clase necesita un DepartamentoRepository y se lo pasa solo.
    // No hace falta @Autowired explicito: cuando una clase tiene UN SOLO
    // constructor, Spring lo usa automaticamente para inyectar dependencias.
    public DepartamentoService(DepartamentoRepository departamentoRepository) {
        this.departamentoRepository = departamentoRepository;
    }

    public List<Departamento> listarTodos() {
        return departamentoRepository.findAll();
    }

    public Departamento buscarPorId(Long id) {
        return departamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departamento no encontrado con id: " + id));
    }

    public Departamento guardar(Departamento departamento) {
        return departamentoRepository.save(departamento);
    }

    public void eliminar(Long id) {
        // Si el departamento tiene empleados asociados (FK con nullable=false),
        // MariaDB lanzara un error de integridad referencial. Esa excepcion
        // se traduce en Spring a DataIntegrityViolationException, la cual
        // capturamos en el Controller para mostrar un mensaje amigable.
        departamentoRepository.deleteById(id);
    }
}
