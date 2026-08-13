package com.empresa.sistema_empleados.config;

import com.empresa.sistema_empleados.entity.Departamento;
import com.empresa.sistema_empleados.repository.DepartamentoRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

// El <select> del formulario de empleados envia solo el ID del departamento
// (un String, ej "3"), pero el campo "departamento" en la entidad Empleado es
// un objeto Departamento completo. Este Converter le enseña a Spring como pasar
// de un String (el id) a un objeto Departamento real, buscandolo en la base de datos.
// Sin esto, Spring lanza un error de "Failed to convert property value" al
// guardar el formulario.
@Component
public class DepartamentoConverter implements Converter<String, Departamento> {

    private final DepartamentoRepository departamentoRepository;

    public DepartamentoConverter(DepartamentoRepository departamentoRepository) {
        this.departamentoRepository = departamentoRepository;
    }

    @Override
    @Nullable
    public Departamento convert(String id) {
        // Con @NonNullApi en package-info.java, el parametro "id" ya se garantiza
        // no-null por contrato; solo validamos que no venga vacio (ej. si el
        // <option> placeholder deshabilitado llegara a enviarse).
        if (id.isBlank()) {
            return null;
        }
        return departamentoRepository.findById(Long.valueOf(id)).orElse(null);
    }
}
