/* =========================================================
   1. CLASES Y BUILDER (Patrón Builder + Prototype)
========================================================= */
function Alumno() {
    this.datosPersonales = {};
    this.familiares = [];
    this.direccion = {};
    this.datosAcademicos = {};
    this.datosMedicos = {};
}

// Requisito: Uso de Prototype para métodos
Alumno.prototype.generarResumenHTML = function () {
    const lista = arr => arr && arr.length ? arr.join(', ') : 'Ninguno';
    let familiaresHTML = '';
    
    this.familiares.forEach((f, i) => {
        familiaresHTML += `
        <div class="border rounded p-2 mb-2 bg-white">
            <strong>${i === 0 ? 'Familiar Principal' : 'Familiar Adicional'}:</strong><br>
            ${f.nombre} ${f.apellidos} (NIF: ${f.nif})<br>
            <small>Prof: ${f.profesion || 'No consta'} - Nacio en: ${f.ciudad}<br>
            Lengua: ${f.lengua || 'No consta'} | Idiomas: ${lista(f.idiomas)}</small>
        </div>`;
    });

    return `
    <h6 class="text-primary border-bottom">Datos del Alumno</h6>
    <p><strong>${this.datosPersonales.nombre} ${this.datosPersonales.apellidos}</strong><br>
       NIF: ${this.datosPersonales.nif}<br>
       Lengua: ${this.datosPersonales.lengua} | Idiomas: ${lista(this.datosPersonales.idiomas)}</p>

    <h6 class="text-primary border-bottom mt-3">Familiares (${this.familiares.length})</h6>
    ${familiaresHTML}

    <h6 class="text-primary border-bottom mt-3">Dirección</h6>
    <p>${this.direccion.calle}<br>
       ${this.direccion.poblacion}, ${this.direccion.ciudad} (${this.direccion.pais})<br>
       CP: ${this.direccion.cp}</p>

    <h6 class="text-primary border-bottom mt-3">Académico</h6>
    <p>Colegio: ${this.datosAcademicos.colegio}<br>
       Nivel: ${this.datosAcademicos.nivelAlcanzado}<br>
       Idiomas Estudiados: ${lista(this.datosAcademicos.idiomas)}<br>
       Solicita: ${this.datosAcademicos.nivelSolicitado}</p>

    <h6 class="text-primary border-bottom mt-3">Médico</h6>
    <p>Alergias: ${lista(this.datosMedicos.alergias)}<br>
       Medicación: ${this.datosMedicos.medicacion || 'Ninguna'}</p>
    `;
};

// Requisito: Clase implementada con patrón Builder
function AlumnoBuilder() { this.alumno = new Alumno(); }

AlumnoBuilder.prototype.setDatosPersonales = function (nombre, apellidos, nif, lengua, idiomas) {
    this.alumno.datosPersonales = { nombre, apellidos, nif, lengua, idiomas }; return this;
};
AlumnoBuilder.prototype.addFamiliar = function (nombre, apellidos, nif, profesion, ciudad, lengua, idiomas) {
    this.alumno.familiares.push({ nombre, apellidos, nif, profesion, ciudad, lengua, idiomas }); return this;
};
AlumnoBuilder.prototype.setDireccion = function (pais, ciudad, poblacion, calle, cp) {
    this.alumno.direccion = { pais, ciudad, poblacion, calle, cp }; return this;
};
AlumnoBuilder.prototype.setDatosAcademicos = function (colegio, nivelAlcanzado, idiomas, nivelSolicitado) {
    this.alumno.datosAcademicos = { colegio, nivelAlcanzado, idiomas, nivelSolicitado }; return this;
};
AlumnoBuilder.prototype.setDatosMedicos = function (alergias, medicacion) {
    this.alumno.datosMedicos = { alergias, medicacion }; return this;
};
AlumnoBuilder.prototype.build = function () { return this.alumno; };

/* =========================================================
   2. VALIDACIONES Y UTILIDADES UI
========================================================= */

function mostrarErrorInput(idInput, idMensaje, mensaje) {
    const input = document.getElementById(idInput);
    const divError = document.getElementById(idMensaje);
    if(input) input.classList.add('is-invalid');
    if (divError) {
        divError.textContent = mensaje;
        divError.style.display = 'block';
    }
}

function mostrarErrorGlobal(mensaje) {
    const box = document.getElementById('mensajeGlobal');
    box.textContent = mensaje;
    box.classList.remove('d-none');
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function limpiarErrores() {
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    const errorNif = document.getElementById('errorNif'); if(errorNif) errorNif.textContent = '';
    const errorCp = document.getElementById('errorCp'); if(errorCp) errorCp.textContent = '';
    const globalBox = document.getElementById('mensajeGlobal');
    if(globalBox) {
        globalBox.classList.add('d-none');
        globalBox.textContent = '';
    }
    document.getElementById('containerIdiomas').style.border = "1px solid #dee2e6";
    // !!! NUEVO: Limpiar borde rojo de idiomas estudiados
    document.getElementById('containerIdiomasEstudiados').style.border = "1px solid #dee2e6";
}

const Validaciones = {
    // Requisito: El NIF debe cumplir con el formato correcto.
    esNIFValido(nif) {
        const regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
        if (!regex.test(nif)) return false;
        const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        const letra = nif.charAt(8).toUpperCase();
        const numero = parseInt(nif.substring(0, 8));
        return letras[numero % 23] === letra;
    },
    // Requisito: El código postal debe validar el formato numérico.
    esCPValido(cp) {
        return /^\d{5}$/.test(cp);
    }
};

/* =========================================================
   3. CARGA DE DATOS Y EVENTOS
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    let datosJSON;
    let familiaresTemp = []; 

    // Helpers
    const llenarSelect = (id, datos, ph) => {
        const s = document.getElementById(id);
        s.innerHTML = `<option value="" disabled selected>${ph}</option>`;
        datos.forEach(d => {
            const v = (typeof d === 'object') ? d.nombre : d;
            const o = document.createElement('option'); o.value = v; o.textContent = v; s.appendChild(o);
        });
        s.disabled = false;
    };
    
    const generarCheckboxes = (id, datos, pre) => {
        const c = document.getElementById(id); c.innerHTML = '';
        datos.forEach((d, i) => {
            c.innerHTML += `<div class="form-check"><input class="form-check-input" type="checkbox" value="${d}" id="${pre}${i}"><label class="form-check-label" for="${pre}${i}">${d}</label></div>`;
        });
    };

    const getCheckboxValues = id => Array.from(document.querySelectorAll(`#${id} input:checked`)).map(c => c.value);

    // Requisito: Carga de Datos desde JSON (Fetch)
    fetch('datos.json').then(r => r.json()).then(json => {
        datosJSON = json;
        llenarSelect('lenguaMaterna', datosJSON.lenguas, 'Seleccione...');
        llenarSelect('famLengua', datosJSON.lenguas, 'Seleccione...');
        llenarSelect('famProfesion', datosJSON.profesiones, 'Seleccione...');
        llenarSelect('nivelEstudios', datosJSON.nivelesEstudio, 'Seleccione...');
        llenarSelect('nivelSolicitado', datosJSON.nivelesEstudio, 'Seleccione...');
        generarCheckboxes('containerIdiomas', datosJSON.idiomas, 'idioma');
        generarCheckboxes('famIdiomas', datosJSON.idiomas, 'famIdioma');
        generarCheckboxes('containerIdiomasEstudiados', datosJSON.idiomas, 'idiomaEst');
        generarCheckboxes('containerAlergias', datosJSON.alergias, 'alergia');

        const paisSelect = document.getElementById('pais');
        paisSelect.innerHTML = '<option value="" disabled selected>Seleccione País...</option>';
        datosJSON.ubicaciones.forEach(u => {
            const opt = document.createElement('option'); opt.value = u.pais; opt.textContent = u.pais; paisSelect.appendChild(opt);
        });
        
        const todasCiudades = datosJSON.ubicaciones.flatMap(u => u.ciudades.map(c => c.nombre));
        llenarSelect('famCiudad', todasCiudades, 'Seleccione ciudad...');
    });

    // Requisito: Los tres campos deben estar relacionados en la carga (Anidados)
    document.getElementById('pais').addEventListener('change', (e) => {
        const datosPais = datosJSON.ubicaciones.find(u => u.pais === e.target.value);
        const ciudadSelect = document.getElementById('ciudad');
        const pobSelect = document.getElementById('poblacion');
        ciudadSelect.innerHTML = '<option value="" disabled selected>Cargando...</option>';
        pobSelect.innerHTML = '<option value="" disabled selected>Esperando...</option>';
        pobSelect.disabled = true;
        if (datosPais) llenarSelect('ciudad', datosPais.ciudades, 'Seleccione ciudad...');
    });

    document.getElementById('ciudad').addEventListener('change', (e) => {
        const pais = document.getElementById('pais').value;
        const datosPais = datosJSON.ubicaciones.find(u => u.pais === pais);
        if (datosPais) {
            const datosCiudad = datosPais.ciudades.find(c => c.nombre === e.target.value);
            if (datosCiudad) llenarSelect('poblacion', datosCiudad.poblaciones, 'Seleccione población...');
        }
    });

    // --- AGREGAR FAMILIAR ---
    const btnAddFam = document.getElementById('btnAgregarFamiliar');
    if (btnAddFam) {
        btnAddFam.addEventListener('click', () => {
            // Limpiar errores previos del familiar
            document.getElementById('famNombre').classList.remove('is-invalid');
            document.getElementById('famApellidos').classList.remove('is-invalid');
            document.getElementById('famNif').classList.remove('is-invalid');
            document.getElementById('famCiudad').classList.remove('is-invalid'); // !!!
            
            const fNombre = document.getElementById('famNombre').value;
            const fApellidos = document.getElementById('famApellidos').value;
            const fNif = document.getElementById('famNif').value;
            const fCiudad = document.getElementById('famCiudad').value; // !!!
            
            let errores = false;

            // Requisitos: Nombre, Apellidos, NIF y CIUDAD obligatorios para familiar
            if (!fNombre) { document.getElementById('famNombre').classList.add('is-invalid'); errores = true; }
            if (!fApellidos) { document.getElementById('famApellidos').classList.add('is-invalid'); errores = true; }
            if (!fNif) { document.getElementById('famNif').classList.add('is-invalid'); errores = true; }
            if (!fCiudad) { document.getElementById('famCiudad').classList.add('is-invalid'); errores = true; }

            // Validación NIF Familiar
            if (fNif && !Validaciones.esNIFValido(fNif)) {
                document.getElementById('famNif').classList.add('is-invalid');
                errores = true; 
            }

            if (errores) {
                mostrarErrorGlobal("Revisa los datos del familiar (Nombre, Apellidos, NIF, Ciudad).");
                return;
            } else {
                document.getElementById('mensajeGlobal').classList.add('d-none');
            }

            familiaresTemp.push({
                nombre: fNombre, apellidos: fApellidos, nif: fNif,
                profesion: document.getElementById('famProfesion').value,
                ciudad: fCiudad,
                lengua: document.getElementById('famLengua').value,
                idiomas: getCheckboxValues('famIdiomas')
            });

            const div = document.createElement('div');
            div.className = "alert alert-success mt-2 py-2 mb-2 d-flex align-items-center";
            div.innerHTML = `<i class="bi bi-person-check-fill me-2"></i> <span>Familiar añadido: <strong>${fNombre}</strong></span>`;
            document.getElementById('familiaresExtraContainer').appendChild(div);

            // Reset campos familiar
            document.getElementById('famNombre').value = '';
            document.getElementById('famApellidos').value = '';
            document.getElementById('famNif').value = '';
            document.getElementById('famCiudad').value = ''; // Reset select
            document.getElementById('famProfesion').value = ''; // Reset select
            document.getElementById('famLengua').value = ''; // Reset select
            document.querySelectorAll('#famIdiomas input').forEach(c => c.checked = false);
            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        });
    }

    // --- SUBMIT DEL FORMULARIO ---
    document.getElementById('formRegistro').addEventListener('submit', e => {
        e.preventDefault();
        limpiarErrores(); 

        let hayErrores = false;

        // 1. Validar NIF Alumno
        const nifAlumno = document.getElementById('nif').value;
        if (!Validaciones.esNIFValido(nifAlumno)) {
            mostrarErrorInput('nif', 'errorNif', "NIF inválido (letra incorrecta)");
            hayErrores = true;
        }

        // 2. Validar CP Alumno
        const cpAlumno = document.getElementById('cp').value;
        if (!Validaciones.esCPValido(cpAlumno)) {
            mostrarErrorInput('cp', 'errorCp', "CP inválido (5 dígitos)");
            hayErrores = true;
        }

        // 3. Validar Idiomas Alumno (Obligatorio)
        if (getCheckboxValues('containerIdiomas').length === 0) {
            document.getElementById('containerIdiomas').style.border = "1px solid red";
            hayErrores = true;
        }

        // !!! 4. Validar Idiomas ESTUDIADOS (Requisito: "Datos Académicos Todos obligatorios")
        if (getCheckboxValues('containerIdiomasEstudiados').length === 0) {
            document.getElementById('containerIdiomasEstudiados').style.border = "1px solid red";
            hayErrores = true;
        }

        // 5. Validar Familiar (Al menos uno)
        if (familiaresTemp.length === 0) {
            // Intento automático de añadir si hay datos escritos
            const fNombre = document.getElementById('famNombre').value;
            if (fNombre) {
                document.getElementById('btnAgregarFamiliar').click();
                if (familiaresTemp.length === 0) hayErrores = true; // Falló la validación del familiar
            } else {
                mostrarErrorGlobal("Debes asociar al menos un familiar.");
                hayErrores = true;
            }
        }

        if (hayErrores) {
            if(!document.getElementById('mensajeGlobal').textContent) {
                 mostrarErrorGlobal("Hay errores en el formulario. Revisa los campos en rojo.");
            }
            return;
        }

        // --- CONSTRUCCIÓN DEL OBJETO (BUILDER) ---
        const b = new AlumnoBuilder();
        
        b.setDatosPersonales(
            document.getElementById('nombre').value,
            document.getElementById('apellidos').value,
            nifAlumno,
            document.getElementById('lenguaMaterna').value,
            getCheckboxValues('containerIdiomas')
        );

        familiaresTemp.forEach(f => {
            b.addFamiliar(f.nombre, f.apellidos, f.nif, f.profesion, f.ciudad, f.lengua, f.idiomas);
        });

        b.setDireccion(
            document.getElementById('pais').value,
            document.getElementById('ciudad').value,
            document.getElementById('poblacion').value,
            document.getElementById('direccion').value,
            cpAlumno
        );

        b.setDatosAcademicos(
            document.getElementById('colegio').value,
            document.getElementById('nivelEstudios').value,
            getCheckboxValues('containerIdiomasEstudiados'),
            document.getElementById('nivelSolicitado').value
        );

        b.setDatosMedicos(
            getCheckboxValues('containerAlergias'),
            document.getElementById('medicacion').value
        );

        // Requisito: Mostrar resumen en Modal
        const alumnoFinal = b.build();
        document.getElementById('cuerpoModal').innerHTML = alumnoFinal.generarResumenHTML();
        new bootstrap.Modal(document.getElementById('modalResumen')).show();
    });

    // Resetear al cerrar modal
    const modalResumen = document.getElementById('modalResumen');
    modalResumen.addEventListener('hidden.bs.modal', () => {
        document.getElementById('formRegistro').reset();
        familiaresTemp = [];
        document.getElementById('familiaresExtraContainer').innerHTML = '';
        
        const ciudadSelect = document.getElementById('ciudad');
        ciudadSelect.innerHTML = '<option value="" disabled selected>Selecciona País primero...</option>';
        ciudadSelect.disabled = true;

        const poblacionSelect = document.getElementById('poblacion');
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona Ciudad primero...</option>';
        poblacionSelect.disabled = true;

        limpiarErrores();
    });
});