package model;

public class Estudiante extends Persona implements IEvaluable, Comparable<Estudiante> {

    private double matematica;
    private double lengua;
    private double naturales;
    private double sociales;
    private String mes;
    private String curso;

    public Estudiante(String nombre, String apellido,
                      double matematica, double lengua,
                      double naturales,  double sociales,
                      String mes, String curso) {
        super(nombre, apellido);
        this.matematica = matematica;
        this.lengua     = lengua;
        this.naturales  = naturales;
        this.sociales   = sociales;
        this.mes        = mes;
        this.curso      = curso;
    }

    @Override
    public double getPromedio() {
        double[] notas = { matematica, lengua, naturales, sociales };
        int cantidadNotas = notas.length;

        if (cantidadNotas == 0)
            throw new ArithmeticException("Sin calificaciones para: " + nombre + " " + apellido);

        double suma = 0;
        for (double nota : notas) {
            suma += nota;
        }
        return suma / cantidadNotas;
    }

    @Override
    public String getLiteral() {
        double promedio = getPromedio();
        if (promedio >= 90 && promedio <= 100) return "A";
        if (promedio >= 80 && promedio <  90)  return "B";
        if (promedio >= 70 && promedio <  80)  return "C";
        if (promedio >  60 && promedio <  70)  return "D";
        return "F";
    }

    @Override
    public int compareTo(Estudiante otro) {
        return this.apellido.compareToIgnoreCase(otro.apellido);
    }

    public String serializar() {
        return nombre      + "|" + apellido    + "|"
                + (int)matematica + "|" + (int)lengua + "|"
                + (int)naturales  + "|" + (int)sociales + "|"
                + mes         + "|" + curso;
    }

    public double getMatematica() { return matematica; }
    public double getLengua()     { return lengua;     }
    public double getNaturales()  { return naturales;  }
    public double getSociales()   { return sociales;   }
    public String getMes()        { return mes;        }
    public String getCurso()      { return curso;      }
}