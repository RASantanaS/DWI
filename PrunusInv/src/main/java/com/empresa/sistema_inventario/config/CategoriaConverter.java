package com.empresa.sistema_inventario.config;

import com.empresa.sistema_inventario.entity.Categoria;
import com.empresa.sistema_inventario.repository.CategoriaRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class CategoriaConverter implements Converter<String, Categoria> {

    private final CategoriaRepository categoriaRepository;

    public CategoriaConverter(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    @Nullable
    public Categoria convert(String id) {
        if (id.isBlank()) {
            return null;
        }
        return categoriaRepository.findById(Long.valueOf(id)).orElse(null);
    }
}
