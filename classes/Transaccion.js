export class Transaccion {
  // Inicializamos el array cargando lo que haya en localStorage (si no hay nada, devuelve un array vacío [])
  static transacciones = Transaccion.cargarDelLocalStorage();

  constructor(tipo, descripcion, monto, categoria, fecha) {
    this.id = Date.now().toString();
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.monto = parseFloat(monto);
    this.categoria = categoria;
    this.fecha = fecha;
  }

  // AGREGAMOS - Método auxiliar privado/estático para leer del localStorage
  static cargarDelLocalStorage() {
    const datosGuardados = localStorage.getItem("transacciones_hackaton");
    // Si existen datos, los devolvemos. Si no, devolvemos un array vacío.
    return datosGuardados ? JSON.parse(datosGuardados) : [];
  }

  // AGREGAMOS - Método auxiliar estático para guardar el array actual en el localStorage
  static SincronizarLocalStorage() {
    localStorage.setItem(
      "transacciones_hackaton",
      JSON.stringify(Transaccion.transacciones),
    );
  }

  // Modificamos guardar() para que además guarde en el navegador
  guardar() {
    Transaccion.transacciones.push(this);
    Transaccion.SincronizarLocalStorage(); // <-- Guardado automático
  }

  // Modificamos eliminar para que también actualice el localStorage
  static eliminar(id) {
    Transaccion.transacciones = Transaccion.transacciones.filter(
      (t) => t.id !== id,
    );
    Transaccion.SincronizarLocalStorage(); // <-- Sincronización automática al borrar
  }

  static calcularBalance() {
    let totalIngresos = 0;
    let totalGastos = 0;

    Transaccion.transacciones.forEach((t) => {
      if (t.tipo === "ingreso") {
        totalIngresos += t.monto;
      } else {
        totalGastos += t.monto;
      }
    });

    const balanceNeto = totalIngresos - totalGastos;

    return {
      totalIngresos,
      totalGastos,
      balanceNeto,
    };
  }

  static obtenerResumenPorCategorias() {
    const resumen = {};

    Transaccion.transacciones.forEach((t) => {
      if (!resumen[t.categoria]) {
        resumen[t.categoria] = 0;
      }
      resumen[t.categoria] += t.monto;
    });

    return resumen;
  }
}
