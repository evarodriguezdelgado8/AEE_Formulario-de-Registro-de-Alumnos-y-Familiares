/**
 * APP.JS - VERSIÓN FINAL FUNCIONAL
 * - JSON dinámico
 * - Validaciones por eventos + regex
 * - Builder + Prototype
 * - Múltiples familiares
 * - Modal resumen completo
 */

/* =========================================================
   1. CLASE ALUMNO (PROTOTYPE)
========================================================= */
function Alumno() {
    this.datosPersonales = {};
    this.familiares = [];
    this.direccion = {};
    this.datosAcademicos = {};
    this.datosMedicos = {};
}

Alumno.prototype.generarResumenHTML = function () {

    const lista = arr => arr && arr.length ? arr.join(', ') : 'Ninguno';

    let familiaresHTML = '';
    this.familiares.forEach((f, i) => {
        familiaresHTML += `
        <div class="border rounded p-2 mb-2 bg-white">
            <strong>${i === 0 ? 'Familiar Principal' : 'Familiar Adicional'}:</strong><br>
            ${f.nombre} ${f.apellidos} (NIF: ${f.nif})<br>
            <small>
                ${f.profesion} - ${f.ciudad}<br>
                Lengua: ${f.lengua}<br>
                Idiomas: ${lista(f.idiomas)}
            </small>
        </div>`;
    });

    return `
    <h6 class="text-primary border-bottom">Datos del Alumno</h6>
    <p>
        <strong>${this.datosPersonales.nombre} ${this.datosPersonales.apellidos}</strong><br>
        NIF: ${this.datosPersonales.nif}<br>
        Lengua materna: ${this.datosPersonales.lengua}<br>
        Idiomas: ${lista(this.datosPersonales.idiomas)}
    </p>

    <h6 class="text-primary border-bottom mt-3">Familiares (${this.familiares.length})</h6>
    ${familiaresHTML}

    <h6 class="text-primary border-bottom mt-3">Dirección</h6>
    <p>
        ${this.direccion.calle}<br>
        ${this.direccion.poblacion}, ${this.direccion.ciudad} (${this.direccion.pais})<br>
        CP: ${this.direccion.cp}
    </p>

    <h6 class="text-primary border-bottom mt-3">Datos Académicos</h6>
    <p>
        Colegio: ${this.datosAcademicos.colegio}<br>
        Nivel alcanzado: ${this.datosAcademicos.nivelAlcanzado}<br>
        Nivel solicitado: ${this.datosAcademicos.nivelSolicitado}<br>
        Idiomas estudiados: ${lista(this.datosAcademicos.idiomas)}
    </p>

    <h6 class="text-primary border-bottom mt-3">Información Médica</h6>
    <p>
        Alergias: ${lista(this.datosMedicos.alergias)}<br>
        Medicación: ${this.datosMedicos.medicacion || 'Ninguna'}
    </p>
    `;
};

/* =========================================================
   2. BUILDER
========================================================= */
function AlumnoBuilder() {
    this.alumno = new Alumno();
}

AlumnoBuilder.prototype.setDatosPersonales = function (nombre, apellidos, nif, lengua, idiomas) {
    this.alumno.datosPersonales = { nombre, apellidos, nif, lengua, idiomas };
    return this;
};

AlumnoBuilder.prototype.addFamiliar = function (nombre, apellidos, nif, profesion, ciudad, lengua, idiomas) {
    this.alumno.familiares.push({ nombre, apellidos, nif, profesion, ciudad, lengua, idiomas });
    return this;
};

AlumnoBuilder.prototype.setDireccion = function (pais, ciudad, poblacion, calle, cp) {
    this.alumno.direccion = { pais, ciudad, poblacion, calle, cp };
    return this;
};

AlumnoBuilder.prototype.setDatosAcademicos = function (colegio, nivelAlcanzado, idiomas, nivelSolicitado) {
    this.alumno.datosAcademicos = { colegio, nivelAlcanzado, idiomas, nivelSolicitado };
    return this;
};

AlumnoBuilder.prototype.setDatosMedicos = function (alergias, medicacion) {
    this.alumno.datosMedicos = { alergias, medicacion };
    return this;
};

AlumnoBuilder.prototype.build = function () {
    return this.alumno;
};

/* =========================================================
   3. VALIDACIONES
========================================================= */
const Validaciones = {
    esNIFValido(nif) {
        const regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
        if (!regex.test(nif)) return false;
        const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        return letras[nif.substr(0, 8) % 23] === nif.substr(8, 1).toUpperCase();
    },
    esCPValido(cp) {
        return /^\d{5}$/.test(cp);
    }
};

function validarCheckboxObligatorio(id, mensaje) {
    if (document.querySelectorAll(`#${id} input:checked`).length === 0) {
        alert(mensaje);
        return false;
    }
    return true;
}

/* =========================================================
   4. UTILIDADES DOM
========================================================= */
function llenarSelect(id, datos, placeholder) {
    const select = document.getElementById(id);
    select.innerHTML = `<option disabled selected>${placeholder}</option>`;
    datos.forEach(d => {
        const o = document.createElement('option');
        o.value = d;
        o.textContent = d;
        select.appendChild(o);
    });
}

function generarCheckboxes(id, datos, prefijo) {
    const c = document.getElementById(id);
    c.innerHTML = '';
    datos.forEach((d, i) => {
        c.innerHTML += `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${d}" id="${prefijo}${i}">
            <label class="form-check-label" for="${prefijo}${i}">${d}</label>
        </div>`;
    });
}

const getCheckboxValues = id =>
    Array.from(document.querySelectorAll(`#${id} input:checked`)).map(c => c.value);

/* =========================================================
   5. LÓGICA PRINCIPAL
========================================================= */
document.addEventListener('DOMContentLoaded', () => {

    let datos;
    let familiaresTemp = [];

    fetch('datos.json')
        .then(r => r.json())
        .then(json => {
            datos = json;

            llenarSelect('lenguaMaterna', datos.lenguas, 'Lengua...');
            llenarSelect('famLengua', datos.lenguas, 'Lengua...');
            llenarSelect('famProfesion', datos.profesiones, 'Profesión...');
            llenarSelect('nivelEstudios', datos.nivelesEstudio, 'Nivel...');
            llenarSelect('nivelSolicitado', datos.nivelesEstudio, 'Nivel...');

            generarCheckboxes('containerIdiomas', datos.idiomas, 'idioma');
            generarCheckboxes('famIdiomas', datos.idiomas, 'famIdioma');
            generarCheckboxes('containerIdiomasEstudiados', datos.idiomas, 'idiomaEst');
            generarCheckboxes('containerAlergias', datos.alergias, 'alergia');

            const pais = document.getElementById('pais');
            pais.innerHTML = '<option disabled selected>País...</option>';
            datos.ubicaciones.forEach(u => pais.innerHTML += `<option>${u.pais}</option>`);

            const ciudades = datos.ubicaciones.flatMap(u => u.ciudades.map(c => c.nombre));
            llenarSelect('famCiudad', ciudades, 'Ciudad...');
        });

    document.getElementById('btnAgregarFamiliar').addEventListener('click', () => {

        if (!famNombre.value || !famApellidos.value || !famNif.value) {
            alert('Completa los datos del familiar');
            return;
        }

        if (!validarCheckboxObligatorio('famIdiomas', 'Selecciona idiomas del familiar')) return;

        familiaresTemp.push({
            nombre: famNombre.value,
            apellidos: famApellidos.value,
            nif: famNif.value,
            profesion: famProfesion.value,
            ciudad: famCiudad.value,
            lengua: famLengua.value,
            idiomas: getCheckboxValues('famIdiomas')
        });

        actualizarListaFamiliares();

        famNombre.value = '';
        famApellidos.value = '';
        famNif.value = '';
    });

    function actualizarListaFamiliares() {
        const cont = document.getElementById('listaFamiliares');
        cont.innerHTML = '';
        familiaresTemp.forEach((f, i) => {
            cont.innerHTML += `
            <div class="alert alert-secondary p-2">
                <strong>${i === 0 ? 'Principal' : 'Adicional'}:</strong>
                ${f.nombre} ${f.apellidos} (${f.nif})
            </div>`;
        });
    }

    document.getElementById('formRegistro').addEventListener('submit', e => {
        e.preventDefault();

        if (!validarCheckboxObligatorio('containerIdiomas', 'Selecciona idiomas del alumno')) return;
        if (!validarCheckboxObligatorio('containerIdiomasEstudiados', 'Selecciona idiomas estudiados')) return;

        const b = new AlumnoBuilder();

        b.setDatosPersonales(
            nombre.value,
            apellidos.value,
            nif.value,
            lenguaMaterna.value,
            getCheckboxValues('containerIdiomas')
        );

        familiaresTemp.forEach(f => {
            b.addFamiliar(
                f.nombre,
                f.apellidos,
                f.nif,
                f.profesion,
                f.ciudad,
                f.lengua,
                f.idiomas
            );
        });

        b.setDireccion(
            pais.value,
            ciudad.value,
            poblacion.value,
            direccion.value,
            cp.value
        );

        b.setDatosAcademicos(
            colegio.value,
            nivelEstudios.value,
            getCheckboxValues('containerIdiomasEstudiados'),
            nivelSolicitado.value
        );

        b.setDatosMedicos(
            getCheckboxValues('containerAlergias'),
            medicacion.value
        );

        document.getElementById('cuerpoModal').innerHTML = b.build().generarResumenHTML();
        new bootstrap.Modal(modalResumen).show();
    });
});
