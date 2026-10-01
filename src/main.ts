import {CRMController} from './controllers/crm.controller';
import type { Usuario } from './models/interfaces';

// Instanciamos el motor (creamos el objeto en memoria)
const miEscuelaCRM = new CRMController("1.0.0");
let todosLosUsuarios: Usuario[] = [];

async function leerTodosLosUsuarios() {
    console.log("Leyendo todos los usuarios");
    todosLosUsuarios = await miEscuelaCRM.leerTodosAsync();
    console.log(todosLosUsuarios);
}

leerTodosLosUsuarios();

async function pintarUSuariosEnPantalla(): Promise<void> {
    // Capturmos el contenedor donde vamos a pintar la lista de usuarios
    const contenedor = document.getElementById("lista-usuarios") as HTMLDivElement;
    if (!contenedor) return; // Si no existe el contenedor, salimos de la función

    // Limpiamos el contenedor antes de pintar
    contenedor.innerHTML = "";

    const usuarios = await miEscuelaCRM.filtrarUsuariosPorRol("alumno"); // Obtenemos los alumnos
    usuarios.forEach((usuario) => {
        const elementoUsuario = document.createElement("p");
        elementoUsuario.textContent = usuario.nombre;
        contenedor.appendChild(elementoUsuario);
    });
}

pintarUSuariosEnPantalla();
 async function addUsuario() {
    console.log("Agregando un nuevo usuario...");
    let guardaConExito =  false;
    guardaConExito = await miEscuelaCRM.registrarUsuarioAsync({ id:1 , nombre: "Ana Torres", rol: "alumno", activo: true, apellidos: "García", email: "ana.torres@example.com" });
    if (guardaConExito) {
        console.log("Usuario agregado con éxito.");
    } else {
        console.log("Error al agregar el usuario.");
    }
}

addUsuario();

console.log("Versión del CRM:", miEscuelaCRM.verVersion());
// Usamos sus métodos
const profesores = miEscuelaCRM.filtrarUsuariosPorRol("profesor");


console.log("Profesores del centro:", profesores);

// miEscuelaCRM.agregarUsuario({ id:7, nombre: "Carlos Ruiz", rol: "profesor", activo: true });


async function ejecutarPruebasPractica1() {
    console.log("=== Iniciando pruebas de la Practica 1 ===");

    console.log("Registrando una asistencia...");
    const guardado = await miEscuelaCRM.registrarAsistencia('3', '2', '1ª Hora', 'falta');
    if (guardado) {
        console.log("Asistencia registrada con exito en localStorage.");
    }

    console.log("Registrando una sancion...");
    await miEscuelaCRM.registrarSancion('3', '2', 'comportamiento', 'Uso inadecuado del material');
    console.log("Sancion guardada.");

    console.log("Comprobando conflictos...");
    const conflicto = await miEscuelaCRM.comprobarConflictoProfesor('2', 'Lunes', '1ª Hora');
    console.log(`Hay conflicto horario?: ${conflicto}`);

    console.log("Generando informe...");
    const informe = await miEscuelaCRM.obtenerInformeAlumno('3');
    console.log("Informe del alumno:", informe);
}

ejecutarPruebasPractica1();