import { Transaccion } from "./classes/Transaccion.js";

// 1. Selección de elementos del DOM
const formTransaccion = document.getElementById("form-transaccion");
const inputDescripcion = document.getElementById("descripcion");
const inputMonto = document.getElementById("monto");
const inputTipo = document.getElementById("tipo");
const inputCategoria = document.getElementById("categoria");
const inputFecha = document.getElementById("fecha");

const tablaMovimientos = document.getElementById("tabla-movimientos");
const totalIngresosUI = document.getElementById("total-ingresos");
const totalGastosUI = document.getElementById("total-gastos");
const balanceNetoUI = document.getElementById("balance-neto");
const graficoCategorias = document.getElementById("graficoCategorias");
const graficoTemporal = document.getElementById("graficoTemporal");
let chartCategorias = null;
let chartTemporal = null;

// 2. Escuchar el evento submit del formulario
formTransaccion.addEventListener("submit", (e) => {
  e.preventDefault(); // Evita que la página se recargue

  // Obtener valores de los inputs
  const descripcion = inputDescripcion.value.trim();
  const monto = inputMonto.value;
  const tipo = inputTipo.value;
  const categoria = inputCategoria.value;
  const fecha = inputFecha.value;

  // Validar que los campos no estén vacíos
  if (!descripcion || !monto || !tipo || !categoria || !fecha) return;

  // Crear la nueva instancia de la clase Transaccion
  const nuevaTransaccion = new Transaccion(
    tipo,
    descripcion,
    monto,
    categoria,
    fecha,
  );

  // Guardar en el array estático
  nuevaTransaccion.guardar();

  // Actualizar la interfaz visual
  actualizarApp();

  // Limpiar el formulario
  formTransaccion.reset();
  inputDescripcion.focus();
});

// 3. Función principal para actualizar toda la interfaz
function actualizarApp() {
  renderizarTabla();
  actualizarBalances();
  renderizarGraficoCategorias();
  renderizarGraficoTemporal();
}

// 4. Renderizar la tabla de movimientos
function renderizarTabla() {
  // Limpiar la tabla antes de volver a pintarla
  tablaMovimientos.innerHTML = "";

  const transacciones = Transaccion.transacciones;

  // Si no hay transacciones, mostrar mensaje de vacío
  if (transacciones.length === 0) {
    tablaMovimientos.innerHTML = `
            <tr id="fila-vacia">
                <td colspan="6" class="py-8 text-center text-slate-400">No hay movimientos registrados aún.</td>
            </tr>
        `;
    return;
  }

  // Recorrer el array y generar las filas dinámicamente
  transacciones.forEach((t) => {
    const tr = document.createElement("tr");
    tr.className =
      "border-b border-slate-100 hover:bg-slate-50 transition duration-150";

    // Estilo condicional para el monto y tipo (Verde para ingreso, Rojo para gasto)
    const esIngreso = t.tipo === "ingreso";
    const colorMonto = esIngreso ? "text-emerald-600" : "text-rose-600";
    const signoMonto = esIngreso ? "+" : "-";
    const badgeTipo = esIngreso
      ? '<span class="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full">Ingreso</span>'
      : '<span class="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 rounded-full">Gasto</span>';

    tr.innerHTML = `
    <td class="py-3 px-4 font-medium text-slate-600">${new Date(t.fecha).toLocaleDateString("es-AR")}</td>
            <td class="py-3 px-4 font-medium text-slate-800">${t.descripcion}</td>
            <td class="py-3 px-4 text-slate-600">${t.categoria}</td>
            <td class="py-3 px-4">${badgeTipo}</td>
            <td class="py-3 px-4 font-bold ${colorMonto}">${signoMonto}$${t.monto.toFixed(2)}</td>
            <td class="py-3 px-4 text-center">
                <button data-id="${t.id}" class="btn-eliminar text-slate-400 hover:text-rose-600 p-1 rounded-lg transition duration-150" title="Eliminar registro">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </td>
        `;

    tablaMovimientos.appendChild(tr);
  });

  // Agregar eventos a los botones de eliminar recién creados
  document.querySelectorAll(".btn-eliminar").forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const idTransaccion = e.currentTarget.getAttribute("data-id");
      // Confirmar antes de eliminar
      if (confirm("¿Estás seguro de que deseas eliminar este movimiento?")) {
        Transaccion.eliminar(idTransaccion);
        actualizarApp(); // Volver a refrescar toda la pantalla
      }
    });
  });
}

// 5. Actualizar las tarjetas de balance global superior
function actualizarBalances() {
  const { totalIngresos, totalGastos, balanceNeto } =
    Transaccion.calcularBalance();

  totalIngresosUI.textContent = `$${totalIngresos.toFixed(2)}`;
  totalGastosUI.textContent = `$${totalGastos.toFixed(2)}`;
  balanceNetoUI.textContent = `$${balanceNeto.toFixed(2)}`;

  // Dar color dinámico al balance neto según si es positivo o negativo
  if (balanceNeto >= 0) {
    balanceNetoUI.className = "text-3xl font-bold text-blue-600 mt-2";
  } else {
    balanceNetoUI.className = "text-3xl font-bold text-rose-600 mt-2";
  }
}

function renderizarGraficoCategorias() {
  const resumen = Transaccion.obtenerResumenPorCategorias();

  const labels = Object.keys(resumen);
  const datos = Object.values(resumen);

  if (chartCategorias) {
    chartCategorias.destroy();
  }

  chartCategorias = new Chart(graficoCategorias, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Monto por categoría",
          data: datos,
          backgroundColor: [
            "#3B82F6",
            "#10B981",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
            "#06B6D4",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}
//Renderizar el grafico temporal
function renderizarGraficoTemporal() {
  const transacciones = [...Transaccion.transacciones];
  const movimientosPorFecha = {};

  transacciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  transacciones.forEach((t) => {
    const fecha = t.fecha;

    if (!movimientosPorFecha[fecha]) {
      movimientosPorFecha[fecha] = {
        ingresos: 0,
        gastos: 0,
      };
    }
    if (t.tipo === "ingreso") {
      movimientosPorFecha[fecha].ingresos += t.monto;
    } else {
      movimientosPorFecha[fecha].gastos += t.monto;
    }
  });

  const fechas = [];
  const ingresos = [];
  const gastos = [];
  const balances = [];

  const fechasOrdenadas = Object.keys(movimientosPorFecha).sort();

  let balanceAcumulado = 0;

  fechasOrdenadas.forEach((fecha) => {
    const movimiento = movimientosPorFecha[fecha];

    fechas.push(new Date(fecha + "T00:00:00").toLocaleDateString("es-AR"));
    ingresos.push(movimiento.ingresos);
    gastos.push(movimiento.gastos);
    balanceAcumulado += movimiento.ingresos - movimiento.gastos;
    balances.push(balanceAcumulado);
  });

  if (chartTemporal) {
    chartTemporal.destroy();
  }

  chartTemporal = new Chart(graficoTemporal, {
    type: "line",
    data: {
      labels: fechas,
      datasets: [
        {
          label: "Ingresos",
          data: ingresos,
          borderColor: "#10B981",
          backgroundColor: "#10B981",
        },
        {
          label: "Gastos",
          data: gastos,
          borderColor: "#EF4444",
          backgroundColor: "#EF4444",
        },
        {
          label: "Balance Neto",
          data: balances,
          borderColor: "#3B82F6",
          backgroundColor: "#3B82F6",
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

// 7. LLAMADA INICIAL AL CARGAR LA PAGINA
// Esto asegura que si ya había datos guardados, la pantalla los muestre de inmediato al abrir la app.
actualizarApp();
