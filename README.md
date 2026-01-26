# Proyecto: Sistema de Registro de Alumnos (DWEC)

Este proyecto consiste en un formulario avanzado de alta de alumnos que integra validaciones complejas, carga de datos dinámica mediante JSON y una arquitectura basada en objetos y patrones de diseño.

## 🚀 Requisitos de Ejecución

**IMPORTANTE:** Debido al uso de la **Fetch API** para la carga del archivo `datos.json`, no es posible ejecutar el proyecto abriendo el archivo `index.html` directamente (protocolo `file:///`).

Para visualizarlo correctamente:
1. Abrir la carpeta en **Visual Studio Code**.
2. Utilizar la extensión **Live Server**.
3. Hacer clic en "Go Live" o clic derecho sobre `index.html` > **Open with Live Server**.

O también:
### Ejecución con XAMPP
1.  Asegúrese de tener **XAMPP** instalado y el servicio **Apache** iniciado (botón "Start").
2.  Copie la carpeta del proyecto dentro del directorio público de XAMPP:
    * Ruta típica: `C:\xampp\htdocs\AEE_Formulario-de-Registro-de-Alumnos-y-Familiares`
3.  Abra su navegador web y acceda a la ruta local:
    * URL: `http://localhost/AEE_Formulario-de-Registro-de-Alumnos-y-Familiares`

## 🛠️ Tecnologías y Conceptos Aplicados

### 1. Carga de Datos (AJAX/Fetch)
Se utiliza la API `fetch` para consumir el archivo `datos.json`. Los datos cargados incluyen:
* Profesiones, lenguas, idiomas, niveles de estudio y alergias.
* **Selects Anidados:** Lógica de cascada para la ubicación (País -> Ciudad -> Población).

### 2. Arquitectura de Software
* **Patrón Builder:** Implementación de la clase `AlumnoBuilder` para gestionar la construcción paso a paso del objeto `Alumno`.
* **Uso de Prototipos:** Los métodos de clase, como la generación de resúmenes, están definidos en `Alumno.prototype` para optimizar el rendimiento y cumplir con los requisitos de la asignatura.



### 3. Validaciones de Datos
Se han implementado validaciones robustas sin el uso de `alert()`, integrando el feedback directamente en la UI:
* **NIF:** Validación algorítmica mediante el cálculo del módulo 23.
* **CP:** Validación de formato numérico de 5 dígitos mediante expresiones regulares (Regex).
* **Obligatoriedad:** Control de campos de texto, selección obligatoria de al menos un familiar y validación de grupos de checkboxes (multiselección).

### 4. Interfaz de Usuario (UX/UI)
* **Framework:** Bootstrap 5 para el diseño responsive y componentes (Modales, Cards, Inputs).
* **Feedback Dinámico:** Uso de clases `is-invalid` para errores y alertas visuales para confirmaciones de éxito.
* **Auto-Reset:** Limpieza automática de formularios y variables de estado al finalizar el proceso de registro exitoso.

## 📂 Estructura del Entregable
* `index.html`: Estructura y maquetación.
* `app.js`: Lógica, validaciones y clases.
* `datos.json`: Diccionario de datos del sistema.
* `styles.css`: Estilos personalizados y mejoras visuales.
* `README.md`: Documentación técnica del proyecto.

---
**Curso:** Desarrollo de Aplicaciones Web  
**Módulo:** Desarrollo Web en Entorno Cliente (DWEC)  
**Profesor:** Carlos Basulto Pardo  
**Alumno:** EVa Rodríguez Delgado