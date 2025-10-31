// --- Funciones Auxiliares ---

// Función auxiliar para formatear la ecuación ax + by = c
function formatEq(a, b, c, varX = 'x', varY = 'y') {
    let eq = '';
    
    // Coeficiente de X
    if (a !== 0) {
        if (a === 1) eq += varX;
        else if (a === -1) eq += `-${varX}`;
        else eq += `${a}${varX}`;
    }

    // Coeficiente de Y
    if (b !== 0) {
        if (b > 0) {
            eq += (a !== 0 ? ' + ' : '');
            if (b === 1) eq += varY;
            else eq += `${b}${varY}`;
        } else { // b < 0
            if (b === -1) eq += ` - ${varY}`;
            else eq += ` ${b}${varY}`;
        }
    }
    
    if (a === 0 && b === 0) return `0 = ${c}`;

    eq += ` = ${c}`;
    // Limpieza de formato como '2x + -3y'
    return eq.replace(/\+ -/g, '- ').trim();
}

// Función auxiliar para obtener el Máximo Común Divisor (MCD)
function mcd(a, b) {
    return b ? mcd(b, a % b) : a;
}

// Función auxiliar para simplificar fracciones y devolver texto
function simplify(numerator, denominator) {
    if (denominator === 0) return { num: numerator, den: 0, text: "INDETERMINADO" };
    if (numerator === 0) return { num: 0, den: 1, text: "0" };

    const common = mcd(Math.abs(numerator), Math.abs(denominator));
    
    let num_s = numerator / common;
    let den_s = denominator / common;
    
    // Ajustar el signo si es necesario
    if (den_s < 0) {
        num_s = -num_s;
        den_s = -den_s;
    }
    
    if (den_s === 1) {
        return { num: num_s, den: 1, text: `${num_s}` };
    }

    return { num: num_s, den: den_s, text: `${num_s}/${den_s}` };
}

// Helper para Despeje: y = m*x + n (para el método gráfico)
function despejarY(a, b, c) {
    if (b === 0) return { m: NaN, n: NaN, formula: "No se puede despejar 'y'." };
    
    const m_num = -a;
    const m_den = b;
    const n_num = c;
    const n_den = b;
    
    const m_s = simplify(m_num, m_den).text;
    const n_s = simplify(n_num, n_den).text;
    
    let formula = "";

    // Pendiente (m)
    const m_val = m_num / m_den;
    const n_val = n_num / n_den;

    if (m_num !== 0) {
        formula += `${m_s}x`;
    }

    // Intercepto (n)
    if (n_num !== 0) {
        if (formula.length > 0) {
            formula += n_val > 0 ? ` + ${n_s}` : ` ${n_s}`;
        } else {
            formula += n_s;
        }
    }

    return { m: m_val, n: n_val, formula: `y = ${formula}` };
}

// Helper para Tabulación (para el método gráfico)
function getTabulation(a, b, c) {
    const { m, n } = despejarY(a, b, c);
    
    // Puntos para la tabla: x=0 y x=1
    const y0 = n;
    const y1 = m * 1 + n;
    
    // Formato de salida con un máximo de 2 decimales
    const format = (val) => Number.isInteger(val) ? val : parseFloat(val.toFixed(2));

    return `
        <p><b>Tabulación (Punto 1): x = 0</b></p>
        <p>y = ${format(m)}*(0) + ${format(n)} = ${format(y0)} (Punto: (0, ${format(y0)}))</p>
        <p><b>Tabulación (Punto 2): x = 1</b></p>
        <p>y = ${format(m)}*(1) + ${format(n)} = ${format(y1)} (Punto: (1, ${format(y1)}))</p>
    `;
}

// --- Función para Dibujar Gráfica con Plotly ---
function drawGraph(a1, b1, c1, a2, b2, c2, x_sol, y_sol) {
    const { m: m1, n: n1 } = despejarY(a1, b1, c1);
    const { m: m2, n: n2 } = despejarY(a2, b2, c2);

    // Rango de X para el gráfico (centrado alrededor de la solución)
    const x_center = x_sol;
    const x_min = x_center - 5;
    const x_max = x_center + 5;
    const x_range = Array.from({ length: 100 }, (_, i) => x_min + i * (x_max - x_min) / 99);
    
    // Calcular Y para cada línea
    const y1_line = x_range.map(x => m1 * x + n1);
    const y2_line = x_range.map(x => m2 * x + n2);
    
    // Datos de las líneas
    const trace1 = {
        x: x_range,
        y: y1_line,
        mode: 'lines',
        name: `Ec. 1: ${formatEq(a1, b1, c1)}`,
        line: { color: 'blue' }
    };

    const trace2 = {
        x: x_range,
        y: y2_line,
        mode: 'lines',
        name: `Ec. 2: ${formatEq(a2, b2, c2)}`,
        line: { color: 'red' }
    };
    
    // Punto de intersección
    const solution_point = {
        x: [x_sol],
        y: [y_sol],
        mode: 'markers',
        type: 'scatter',
        name: `Solución: (${x_sol}, ${y_sol})`,
        marker: { size: 10, color: 'green' }
    };

    const data = [trace1, trace2, solution_point];

    const layout = {
        title: 'Gráfico del Sistema de Ecuaciones',
        xaxis: { title: 'Eje X', zeroline: true, zerolinewidth: 2, range: [x_min, x_max] },
        yaxis: { title: 'Eje Y', zeroline: true, zerolinewidth: 2 },
        hovermode: 'closest',
        autosize: true,
        margin: { t: 50, b: 50, l: 50, r: 50 }
    };

    Plotly.newPlot('graph-container', data, layout);
}


// --- Función Principal de Resolución ---

function resolverSistema() {
    // Obtener valores y parsear a flotante
    const a1 = parseFloat(document.getElementById('a1').value);
    const b1 = parseFloat(document.getElementById('b1').value);
    const c1 = parseFloat(document.getElementById('c1').value);
    const a2 = parseFloat(document.getElementById('a2').value);
    const b2 = parseFloat(document.getElementById('b2').value);
    const c2 = parseFloat(document.getElementById('c2').value);
    const metodo = document.getElementById('metodo').value;
    const outputDiv = document.getElementById('proceso');
    
    outputDiv.innerHTML = '';
    
    // Validación de entrada
    if (isNaN(a1) || isNaN(b1) || isNaN(c1) || isNaN(a2) || isNaN(b2) || isNaN(c2)) {
        outputDiv.innerHTML = '🚨 Error: Por favor, ingresa valores numéricos válidos en todos los campos.';
        // Borrar gráfica si existe
        Plotly.purge('graph-container');
        return;
    }

    // Cálculo de Determinantes (Cramer)
    const D = a1 * b2 - a2 * b1;
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;
    
    let procesoHTML = `<h3>Sistema a Resolver:</h3>
<p>(${formatEq(a1, b1, c1)}) <b>(Ec. 1)</b></p>
<p>(${formatEq(a2, b2, c2)}) <b>(Ec. 2)</b></p>
<p>Método seleccionado: <b>${metodo.toUpperCase()}</b></p><hr>`;
    
    // Manejo de Casos Especiales (Determinante = 0)
    if (D === 0) {
        // Borrar gráfica
        Plotly.purge('graph-container');
        if (Dx === 0 && Dy === 0) {
            procesoHTML += '<p class="final-result">✅ El sistema es Compatible Indeterminado (Infinitas Soluciones).</p>';
        } else {
            procesoHTML += '<p class="final-result">❌ El sistema es Incompatible (No tiene Solución).</p>';
        }
        outputDiv.innerHTML = procesoHTML;
        return;
    }

    // Soluciones finales (simplificadas)
    const x_result = simplify(Dx, D);
    const y_result = simplify(Dy, D);
    
    // Valor decimal para cálculo y gráfico
    const x_val = x_result.num / x_result.den;
    const y_val = y_result.num / y_result.den;
    
    // DIBUJAR LA GRÁFICA INMEDIATAMENTE AL RESOLVER
    drawGraph(a1, b1, c1, a2, b2, c2, x_val, y_val);

    // ====================================================================
    // MÉTODO GRÁFICO
    // ====================================================================
    if (metodo === 'graficacion') {
        procesoHTML += '<h3>MÉTODO GRÁFICO (PASO A PASO):</h3>';
        
        const eq1_despeje = despejarY(a1, b1, c1);
        const eq2_despeje = despejarY(a2, b2, c2);

        procesoHTML += `
            <p><b>Paso 1: Despejar 'y' en ambas ecuaciones para obtener la forma y = mx + n.</b></p>
            <p>Ec. 1: ${formatEq(a1, b1, c1)} \u2192 <b>${eq1_despeje.formula}</b></p>
            <p>Ec. 2: ${formatEq(a2, b2, c2)} \u2192 <b>${eq2_despeje.formula}</b></p>
            
            <p><b>Paso 2: Tabulación - Obtener dos puntos para graficar la Ec. 1.</b></p>
            ${getTabulation(a1, b1, c1)}
            
            <p><b>Paso 3: Tabulación - Obtener dos puntos para graficar la Ec. 2.</b></p>
            ${getTabulation(a2, b2, c2)}
            
            <p><b>Paso 4: Graficación y Conclusión.</b></p>
            <p>Se trazan las rectas en el plano cartesiano usando los puntos de las tablas. El punto donde las dos rectas se cruzan (intersección) es la solución del sistema.</p>
            <p>Punto de Intersección: (${x_result.text}, ${y_result.text})</p>
        `;
    }

    // ====================================================================
    // MÉTODO DE IGUALACIÓN
    // ====================================================================
    else if (metodo === 'igualacion') {
        procesoHTML += '<h3>MÉTODO DE IGUALACIÓN:</h3>';
        
        // Paso 1: Despejar 'y' en ambas ecuaciones
        procesoHTML += `
            <p><b>Paso 1: Despejar 'y' en ambas ecuaciones.</b></p>
            <p>Ec. 1 \u2192 y = (${c1} - ${a1}x) / ${b1}</p>
            <p>Ec. 2 \u2192 y = (${c2} - ${a2}x) / ${b2}</p>`;
            
        // Paso 2: Igualar los despejes
        procesoHTML += `
            <p><b>Paso 2: Igualar las expresiones y resolver para 'x'.</b></p>
            <p>(${c1} - ${a1}x) / ${b1} = (${c2} - ${a2}x) / ${b2}</p>
            <p>${b2}*(${c1} - ${a1}x) = ${b1}*(${c2} - ${a2}x)</p>
            <p>(${b2 * c1} - ${b2 * a1}x) = (${b1 * c2} - ${b1 * a2}x)</p>
            <p>(${b1 * a2 - b2 * a1})x = ${b1 * c2 - b2 * c1}</p>
            <p class="final-result">x = (${b1 * c2 - b2 * c1}) / (${b1 * a2 - b2 * a1}) = ${x_result.text}</p>`;
        
        // Paso 3: Sustituir x para encontrar y (DETALLADO)
        const y_sustitucion_num = c1 - a1 * x_val;
        const y_sustitucion_den = b1;
        
        procesoHTML += `
            <p><b>Paso 3: Sustituir x = ${x_result.text} en el despeje de Ec. 1 para encontrar 'y'.</b></p>
            <p>y = (${c1} - ${a1}*(${x_result.text})) / ${b1}</p>
            <p>y = (${c1} - ${a1 * x_val}) / ${b1}</p>
            <p>y = (${y_sustitucion_num}) / ${y_sustitucion_den}</p>
            <p class="final-result">y = ${y_result.text}</p>`;
    }

    // ====================================================================
    // MÉTODO DE SUSTITUCIÓN
    // ====================================================================
    else if (metodo === 'sustitucion') {
        procesoHTML += '<h3>MÉTODO DE SUSTITUCIÓN:</h3>';
        
        // Paso 1: Despejar x en Ec. 1
        procesoHTML += `
            <p><b>Paso 1: Despejar 'x' en la Ecuación 1.</b></p>
            <p>Ec. 1 \u2192 x = (${c1} - ${b1}y) / ${a1}  <b>(Ec. 3)</b></p>`;
            
        // Paso 2: Sustituir x en Ec. 2
        procesoHTML += `
            <p><b>Paso 2: Sustituir la Ec. 3 en la Ecuación 2.</b></p>
            <p>${a2} * (${c1} - ${b1}y) / ${a1} + ${b2}y = ${c2}</p>`;
            
        // Paso 3: Resolver para y
        procesoHTML += `
            <p><b>Paso 3: Resolver la ecuación para 'y'.</b></p>
            <p>Multiplicar todo por ${a1}: ${a2}*(${c1} - ${b1}y) + ${b2 * a1}y = ${c2 * a1}</p>
            <p>${a2 * c1} - ${a2 * b1}y + ${b2 * a1}y = ${c2 * a1}</p>
            <p>(${b2 * a1 - a2 * b1})y = ${c2 * a1 - a2 * c1}</p>
            <p class="final-result">y = (${c2 * a1 - a2 * c1}) / (${b2 * a1 - a2 * c1}) = ${y_result.text}</p>`;
        
        // Paso 4: Sustituir y para encontrar x (DETALLADO)
        const x_sustitucion_num = c1 - b1 * y_val;
        const x_sustitucion_den = a1;

        procesoHTML += `
            <p><b>Paso 4: Sustituir y = ${y_result.text} en la Ec. 3 (despeje original).</b></p>
            <p>x = (${c1} - ${b1}*(${y_result.text})) / ${a1}</p>
            <p>x = (${c1} - ${b1 * y_val}) / ${a1}</p>
            <p>x = (${x_sustitucion_num}) / ${x_sustitucion_den}</p>
            <p class="final-result">x = ${x_result.text}</p>`;
    }

    // ====================================================================
    // MÉTODOS DE ELIMINACIÓN Y DETERMINANTES 
    // ====================================================================
    else if (metodo === 'eliminacion') {
        procesoHTML += '<h3>MÉTODO DE ELIMINACIÓN (REDUCCIÓN):</h3>';
        
        // Eliminar y
        procesoHTML += `
            <p><b>Paso 1: Multiplicar las ecuaciones para eliminar 'y'.</b></p>
            <p>Multiplicamos Ec. 1 por ${Math.abs(b2)} y Ec. 2 por ${Math.abs(b1)} (o -${Math.abs(b1)} si los signos de b1 y b2 son iguales).</p>
            <p>(${formatEq(a1 * b2, b1 * b2, c1 * b2)})</p>
            <p>(${formatEq(a2 * b1, b2 * b1, c2 * b1)})</p>
            <p><b>Paso 2: Sumar (o restar) las ecuaciones resultantes.</b></p>
            <p>La incógnita 'y' se elimina, quedando:</p>
            <p>(${a1 * b2 + a2 * b1})x = ${c1 * b2 + c2 * b1}</p>
            <p><b>Paso 3: Resolver para 'x'.</b></p>
            <p class="final-result">x = ${x_result.text}</p>`;
        
        // Eliminar x
        procesoHTML += `
            <p><b>Paso 4: Multiplicar las ecuaciones para eliminar 'x'.</b></p>
            <p>Multiplicamos Ec. 1 por ${Math.abs(a2)} y Ec. 2 por ${-Math.abs(a1)}.</p>
            <p>(${formatEq(a1 * a2, b1 * a2, c1 * a2)})</p>
            <p>(${formatEq(a2 * (-a1), b2 * (-a1), c2 * (-a1))})</p>
            <p><b>Paso 5: Sumar las ecuaciones resultantes.</b></p>
            <p>La incógnita 'x' se elimina, quedando:</p>
            <p>(${b1 * a2 - b2 * a1})y = ${c1 * a2 - c2 * a1}</p>
            <p><b>Paso 6: Resolver para 'y'.</b></p>
            <p class="final-result">y = ${y_result.text}</p>`;
    }
    
    else if (metodo === 'determinantes') {
        procesoHTML += '<h3>MÉTODO DE DETERMINANTES (REGLA DE CRAMER):</h3>';
        
        procesoHTML += `
            <p><b>Paso 1: Calcular el Determinante del Sistema (D).</b></p>
            <p>D = | ${a1}  ${b1} | / | ${a2}  ${b2} |</p>
            <p>D = (${a1} * ${b2}) - (${b1} * ${a2}) = ${a1 * b2} - ${b1 * a2} = ${D}</p>
            
            <p><b>Paso 2: Calcular el Determinante de X (Dx).</b></p>
            <p>Dx = | ${c1}  ${b1} | / | ${c2}  ${b2} |</p>
            <p>Dx = (${c1} * ${b2}) - (${b1} * ${c2}) = ${c1 * b2} - ${b1 * c2} = ${Dx}</p>
            
            <p><b>Paso 3: Calcular el Determinante de Y (Dy).</b></p>
            <p>Dy = | ${a1}  ${c1} | / | ${a2}  ${c2} |</p>
            <p>Dy = (${a1} * ${c2}) - (${c1} * ${a2}) = ${a1 * c2} - ${c1 * a2} = ${Dy}</p>
            
            <p><b>Paso 4: Hallar las soluciones ('x' e 'y').</b></p>
            <p>x = Dx / D = ${Dx} / ${D}</p>
            <p class="final-result">x = ${x_result.text}</p>
            <p>y = Dy / D = ${Dy} / ${D}</p>
            <p class="final-result">y = ${y_result.text}</p>`;
    }

    // Conclusión final (SIN ASTERISCOS)
    procesoHTML += `<hr><p class="final-result">✅ SOLUCIÓN FINAL: x = ${x_result.text}, y = ${y_result.text}</p>`;
    outputDiv.innerHTML = procesoHTML;
}

// --- Función para abrir GeoGebra ---

function graficarSistema() {
    const a1 = parseFloat(document.getElementById('a1').value);
    const b1 = parseFloat(document.getElementById('b1').value);
    const c1 = parseFloat(document.getElementById('c1').value);
    const a2 = parseFloat(document.getElementById('a2').value);
    const b2 = parseFloat(document.getElementById('b2').value);
    const c2 = parseFloat(document.getElementById('c2').value);

    // Formatear ecuaciones para GeoGebra
    const eq1 = `${a1}x + ${b1}y = ${c1}`;
    const eq2 = `${a2}x + ${b2}y = ${c2}`;

    // Crear la URL para GeoGebra
    const geogebraURL = `https://www.geogebra.org/graphing?evaluate=${encodeURIComponent(eq1)}&evaluate=${encodeURIComponent(eq2)}`;

    window.open(geogebraURL, '_blank');
}

// --- Función de Exportación a PDF con html2canvas ---

function exportarAPDF() {
    const input = document.getElementById('printable-content');

    // Muestra una ventana de diálogo para "imprimir" (Guardar como PDF)
    window.print();
    
    // NOTA: Para realizar una conversión más avanzada (como un archivo .pdf descargable)
    // se requeriría una librería como jsPDF después de usar html2canvas.
    // Usar window.print() es el método más simple y efectivo en el navegador.
}
