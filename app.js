/**
 * APP.JS - Versión Híbrida (Fijo + Dinámicos)
 */

// 1. CLASES Y BUILDER (Igual que siempre)
function Alumno() {
    this.datosPersonales = {};
    this.familiares = [];
    this.direccion = {};
    this.datosAcademicos = {}; 
    this.datosMedicos = {};
}

Alumno.prototype.generarResumenHTML = function() {
    const formatearArray = (arr) => (arr && arr.length > 0) ? arr.join(', ') : 'Ninguno';
    
    let familiaresHTML = '';
    this.familiares.forEach((fam, i) => {
        // Diferenciamos visualmente el principal del resto
        const titulo = i === 0 ? "Familiar Principal" : `Familiar Extra #${i}`;
        familiaresHTML += `
            <div class="mb-2 p-2 border rounded bg-white">
                <strong class="text-primary">${titulo}:</strong> ${fam.nombre} ${fam.apellidos}<br>
                <small class="text-muted">${fam.profesion} - ${fam.ciudad} (NIF: ${fam.nif})</small>
            </div>`;
    });

    return `
        <div class="container-fluid">
            <h6 class="text-primary border-bottom pb-2">Datos Personales</h6>
            <p><strong>${this.datosPersonales.nombre} ${this.datosPersonales.apellidos}</strong> (NIF: ${this.datosPersonales.nif})</p>
            
            <h6 class="text-primary border-bottom pb-2 mt-4">Familiares Asociados (${this.familiares.length})</h6>
            <div class="bg-light p-2 rounded">
                ${familiaresHTML}
            </div>

            <h6 class="text-primary border-bottom pb-2 mt-4">Dirección</h6>
            <p>${this.direccion.calle}, ${this.direccion.poblacion} (${this.direccion.pais})</p>
            
            <h6 class="text-primary border-bottom pb-2 mt-4">Académico y Salud</h6>
            <p>Estudios: ${this.datosAcademicos.nivelAlcanzado}</p>
            <p>Alergias: <span class="text-danger">${formatearArray(this.datosMedicos.alergias)}</span></p>
        </div>
    `;
};

class AlumnoBuilder {
    constructor() { this.alumno = new Alumno(); }
    setDatosPersonales(nombre, apellidos, nif, lengua, idiomas) {
        this.alumno.datosPersonales = { nombre, apellidos, nif, lengua, idiomas };
        return this;
    }
    addFamiliar(nombre, apellidos, nif, profesion, ciudad) {
        this.alumno.familiares.push({ nombre, apellidos, nif, profesion, ciudad });
        return this;
    }
    setDireccion(pais, ciudad, poblacion, calle, cp) {
        this.alumno.direccion = { pais, ciudad, poblacion, calle, cp };
        return this;
    }
    setDatosAcademicos(colegio, nivelAlcanzado, idiomas, nivelSolicitado) {
        this.alumno.datosAcademicos = { colegio, nivelAlcanzado, idiomas, nivelSolicitado };
        return this;
    }
    setDatosMedicos(alergias, medicacion) {
        this.alumno.datosMedicos = { alergias, medicacion };
        return this;
    }
    build() { return this.alumno; }
}

const Validaciones = {
    esNIFValido: (nif) => {
        const regexNif = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
        if (!regexNif.test(nif)) return false;
        const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        return letras[nif.substr(0, 8) % 23] === nif.substr(8, 1).toUpperCase();
    },
    esCPValido: (cp) => /^\d{5}$/.test(cp)
};

// 2. UTILIDADES DOM
function generarCheckboxes(containerId, arrayDatos, nombreGrupo) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; 
    arrayDatos.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${item}" id="${nombreGrupo}-${index}">
            <label class="form-check-label" for="${nombreGrupo}-${index}">${item}</label>
        `;
        container.appendChild(div);
    });
}

const getCheckboxValues = (containerId) => {
    return Array.from(document.querySelectorAll(`#${containerId} input:checked`)).map(i => i.value);
};

function llenarSelect(elementoOId, arrayDatos, placeholder = "Selecciona...") {
    const select = (typeof elementoOId === 'string') ? document.getElementById(elementoOId) : elementoOId;
    select.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = "";
    defaultOpt.textContent = placeholder;
    defaultOpt.selected = true;
    defaultOpt.disabled = true;
    select.appendChild(defaultOpt);
    arrayDatos.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item; opt.textContent = item;
        select.appendChild(opt);
    });
}

function toggleError(input, esValido, divErrorId, msgError) {
    // Busca el div de error por ID o intenta buscarlo cerca
    let div = divErrorId ? document.getElementById(divErrorId) : null;
    if (!div) div = input.parentElement.nextElementSibling; // Fallback para estructura flotante

    if (!esValido && input.value !== '') {
        input.classList.add('is-invalid');
        if(div) div.textContent = msgError;
    } else {
        input.classList.remove('is-invalid');
        if(input.value !== '') input.classList.add('is-valid');
        if(div) div.textContent = '';
    }
}

// 3. LÓGICA PRINCIPAL
document.addEventListener('DOMContentLoaded', () => {
    let datosGlobales = {};
    let contadorExtras = 0; // Para los IDs de los familiares extra

    fetch('datos.json')
        .then(res => res.json())
        .then(data => {
            datosGlobales = data;
            inicializarFormulario(data);
        });

    function inicializarFormulario(data) {
        // --- CARGA ELEMENTOS FIJOS ---
        llenarSelect('lenguaMaterna', data.lenguas, "Elige lengua...");
        
        // Familiar Principal (El Fijo)
        llenarSelect('famProfesion', data.profesiones, "Elige profesión...");
        const todasCiudades = data.ubicaciones.flatMap(u => u.ciudades.map(c => c.nombre));
        llenarSelect('famCiudad', todasCiudades, "Ciudad de nacimiento...");

        // Resto de fijos
        generarCheckboxes('containerIdiomas', data.idiomas, 'idioma');
        generarCheckboxes('containerIdiomasEstudiados', data.idiomas, 'idiomaEstudio');
        generarCheckboxes('containerAlergias', data.alergias, 'alergia');
        llenarSelect('nivelEstudios', data.nivelesEstudio, "Nivel actual...");
        llenarSelect('nivelSolicitado', data.nivelesEstudio, "Nivel deseado...");

        // País
        const selectPais = document.getElementById('pais');
        selectPais.innerHTML = '<option value="" selected disabled>Selecciona País...</option>';
        data.ubicaciones.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.pais; opt.textContent = u.pais;
            selectPais.appendChild(opt);
        });
    }

    // --- FUNCIÓN AÑADIR EXTRA ---
    document.getElementById('btnAnadirFamiliar').addEventListener('click', () => {
        contadorExtras++;
        const id = contadorExtras;
        const container = document.getElementById('familiaresExtraContainer');

        const card = document.createElement('div');
        card.className = 'card card-body bg-light mb-3 border shadow-sm familiar-extra'; // clase para identificarlo luego
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="text-secondary m-0">Familiar Adicional #${id}</h6>
                <button type="button" class="btn btn-danger btn-sm btn-eliminar-fam">Eliminar</button>
            </div>
            <div class="row g-2">
                <div class="col-md-6">
                    <div class="form-floating">
                        <input type="text" class="form-control fam-extra-nombre" id="extraNombre-${id}" placeholder="Nombre" required>
                        <label for="extraNombre-${id}">Nombre</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-floating">
                        <input type="text" class="form-control fam-extra-apellidos" id="extraApellidos-${id}" placeholder="Apellidos" required>
                        <label for="extraApellidos-${id}">Apellidos</label>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-floating">
                        <input type="text" class="form-control fam-extra-nif" id="extraNif-${id}" placeholder="NIF" required>
                        <label for="extraNif-${id}">NIF</label>
                    </div>
                    <div class="text-danger small ms-1 error-extra-nif"></div>
                </div>
                <div class="col-md-4">
                    <div class="form-floating">
                        <select class="form-select fam-extra-profesion" id="extraProfesion-${id}"></select>
                        <label for="extraProfesion-${id}">Profesión</label>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-floating">
                        <select class="form-select fam-extra-ciudad" id="extraCiudad-${id}"></select>
                        <label for="extraCiudad-${id}">Ciudad Nac.</label>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);

        // Llenar selects del nuevo card
        const selProf = card.querySelector('.fam-extra-profesion');
        const selCiu = card.querySelector('.fam-extra-ciudad');
        llenarSelect(selProf, datosGlobales.profesiones, "Profesión...");
        const todasCiudades = datosGlobales.ubicaciones.flatMap(u => u.ciudades.map(c => c.nombre));
        llenarSelect(selCiu, todasCiudades, "Ciudad...");

        // Evento eliminar
        card.querySelector('.btn-eliminar-fam').addEventListener('click', () => card.remove());

        // Evento validar NIF Extra
        const inputNif = card.querySelector('.fam-extra-nif');
        const divErr = card.querySelector('.error-extra-nif');
        inputNif.addEventListener('blur', function() {
            if(!Validaciones.esNIFValido(this.value) && this.value !== '') {
                this.classList.add('is-invalid');
                divErr.textContent = 'NIF inválido';
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
                divErr.textContent = '';
            }
        });
    });

    // --- EVENTOS ESTÁTICOS ---
    document.getElementById('nif').addEventListener('blur', function() {
        toggleError(this, Validaciones.esNIFValido(this.value), 'errorNif', 'NIF inválido');
    });
    // Validar NIF del Familiar Principal (Fijo)
    document.getElementById('famNif').addEventListener('blur', function() {
        toggleError(this, Validaciones.esNIFValido(this.value), 'errorFamNif', 'NIF inválido');
    });
    document.getElementById('cp').addEventListener('blur', function() {
        toggleError(this, Validaciones.esCPValido(this.value), 'errorCp', 'CP incorrecto (5 dígitos)');
    });

    // Lógica País->Ciudad->Población (Igual que siempre)
    document.getElementById('pais').addEventListener('change', (e) => {
        const c = document.getElementById('ciudad'), p = document.getElementById('poblacion');
        c.innerHTML='<option disabled selected>Elige Ciudad...</option>'; 
        p.innerHTML='<option disabled selected>Esperando...</option>';
        c.disabled=true; p.disabled=true;
        const paisData = datosGlobales.ubicaciones.find(u => u.pais === e.target.value);
        if(paisData) {
            paisData.ciudades.forEach(ci => {
                const op = document.createElement('option'); op.value=ci.nombre; op.textContent=ci.nombre;
                c.appendChild(op);
            });
            c.disabled=false;
        }
    });
    document.getElementById('ciudad').addEventListener('change', (e) => {
        const p = document.getElementById('poblacion');
        p.innerHTML='<option disabled selected>Elige Población...</option>'; p.disabled=true;
        const paisVal = document.getElementById('pais').value;
        const cData = datosGlobales.ubicaciones.find(u => u.pais === paisVal)?.ciudades.find(ci => ci.nombre === e.target.value);
        if(cData) {
            cData.poblaciones.forEach(po => {
                const op = document.createElement('option'); op.value=po; op.textContent=po;
                p.appendChild(op);
            });
            p.disabled=false;
        }
    });

    // --- SUBMIT ---
    document.getElementById('formRegistro').addEventListener('submit', (e) => {
        e.preventDefault();
        if(document.querySelectorAll('.is-invalid').length > 0) {
            alert("Corrige los campos en rojo"); return;
        }

        const builder = new AlumnoBuilder();
        
        // 1. Datos Personales
        builder.setDatosPersonales(
            document.getElementById('nombre').value,
            document.getElementById('apellidos').value,
            document.getElementById('nif').value,
            document.getElementById('lenguaMaterna').value,
            getCheckboxValues('containerIdiomas')
        );

        // 2. FAMILIARES
        
        // A) Añadimos el Familiar Principal (el fijo)
        builder.addFamiliar(
            document.getElementById('famNombre').value,
            document.getElementById('famApellidos').value,
            document.getElementById('famNif').value,
            document.getElementById('famProfesion').value,
            document.getElementById('famCiudad').value
        );

        // B) Añadimos los Familiares Extras (si hay)
        const extras = document.querySelectorAll('.familiar-extra');
        extras.forEach(card => {
            builder.addFamiliar(
                card.querySelector('.fam-extra-nombre').value,
                card.querySelector('.fam-extra-apellidos').value,
                card.querySelector('.fam-extra-nif').value,
                card.querySelector('.fam-extra-profesion').value,
                card.querySelector('.fam-extra-ciudad').value
            );
        });

        // 3. Resto de datos
        builder.setDireccion(
            document.getElementById('pais').value,
            document.getElementById('ciudad').value,
            document.getElementById('poblacion').value,
            document.getElementById('direccion').value,
            document.getElementById('cp').value
        );
        builder.setDatosAcademicos(
            document.getElementById('colegio').value,
            document.getElementById('nivelEstudios').value,
            getCheckboxValues('containerIdiomasEstudiados'),
            document.getElementById('nivelSolicitado').value
        );
        builder.setDatosMedicos(
            getCheckboxValues('containerAlergias'),
            document.getElementById('medicacion').value
        );

        document.getElementById('cuerpoModal').innerHTML = builder.build().generarResumenHTML();
        new bootstrap.Modal(document.getElementById('modalResumen')).show();
    });
});