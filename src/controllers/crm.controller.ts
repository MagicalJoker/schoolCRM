import type { Usuario, RolUsuario } from "../models/interfaces";
import type { Asistencia, Sancion, RegistroHorario, EstadoAsistencia, TipoSancion, FranjaHoraria, DiaSemana } from '../models/interfaces';
import { StorageService } from '../services/storage.service';

export class CRMController {
  // Propiedades originales
  private usuariosDelCentro: Usuario[] = [];
  private readonly CLAVE_STORAGE = "school-crm-usuarios"; 

  // Propiedades nuevas para la Práctica 1
  private asistenciaStorage = new StorageService<Asistencia>('crm_asistencias');
  private sancionesStorage = new StorageService<Sancion>('crm_sanciones');
  private horariosStorage = new StorageService<RegistroHorario>('crm_horarios');

  // Constructor se ejecuta al nacer el objeto
  constructor(private version: string) {
    // Inicializamo el array de usuarios si no existe en localStorage
    const datosLocales = localStorage.getItem(this.CLAVE_STORAGE);
    if (datosLocales) {
      this.usuariosDelCentro = JSON.parse(datosLocales);
    } else {
      this.usuariosDelCentro = [
        {id: 1, nombre: "Juan Pérez", apellidos: "", rol: "admin", activo: true, email: ""},
        { id: 2, nombre: "María López", apellidos: "", rol: "profesor", activo: true, email: "" },
        { id: 3, nombre: "Carlos García", apellidos: "", rol: "alumno", activo: true, email: "" },
      ]; // Inicializamos el array vacío si no hay datos en localStorage
      // Me falta guardar la lista en localStorage
      this.guardarEnDisco();
    }
  }

  public registrarUsuarioAsync(nuevoUsuario: Usuario): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(
        `[NETWORK]: Conectando con el servidor escolar para registrar a ${nuevoUsuario.id}...`,
      );

      // Simulamos un retraso de red de 2 segundos (2000 milisegundos)
      setTimeout(() => {
        // 1. Validamos si el ID ya existe en nuestro array privado
        const idDuplicado = this.usuariosDelCentro.some(
          (user) => user.id === nuevoUsuario.id,
        );

        if (idDuplicado) {
          console.error(
            `Error: El usuario con ID [${nuevoUsuario.id}] ya existe en el SchoolCRM.`,
          );
          return; // Cortamos la ejecución para no añadirlo
        }

        this.usuariosDelCentro.push(nuevoUsuario);
        this.guardarEnDisco();
        // La operación ha terminado con éxito: resolvemos la promesa
        resolve(true);
      }, 2000);
    });
  }

  public leerTodosAsync(): Promise<Usuario[]> {
    // Este método devuelve el listado completo de usuarios con un retardo de 2 segundos
    return new Promise((resolve) => {
      console.log(
        "[NETWORK]: Conectando con el servidor escolar para leer los usuarios...",
      );
      setTimeout(() => {
        resolve(this.usuariosDelCentro);
      }, 2000);
    });
  }

  // Filtra los usuarios por rol y devuelve una promesa para poder usar await.
  async filtrarUsuariosPorRol(rolBuscado: RolUsuario): Promise<Usuario[]> {
    // Una función async envuelve automáticamente el valor devuelto en una Promise.
    // Usamos this para acceder a los usuarios almacenados en esta clase.
    return this.usuariosDelCentro.filter(
      (usuario) => usuario.rol === rolBuscado,
    );
  }

  actualizaVersion(nuevaVersion: string): void {
    this.version = nuevaVersion;
  }

  verVersion(): string {
    return this.version;
  }

  guardarEnDisco() {
    localStorage.setItem(
      this.CLAVE_STORAGE,
      JSON.stringify(this.usuariosDelCentro),
    );
  }

 // --- PRÁCTICA 1 | 01/10/2026 ---

  public registrarAsistencia(alumnoId: string, profesorId: string, franja: FranjaHoraria, estado: EstadoAsistencia): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(`Conectando para registrar asistencia de ${alumnoId}`);
      
      setTimeout(() => {
        const nuevaAsistencia: Asistencia = {
          id: Date.now().toString(),
          alumnoId,
          profesorId,
          fecha: "hoy",
          franja,
          estado
        };
        
        this.asistenciaStorage.add(nuevaAsistencia);
        resolve(true);
      }, 2000);
    });
  }

  public registrarSancion(alumnoId: string, profesorId: string, tipo: TipoSancion, descripcion: string): Promise<void> {
    return new Promise((resolve) => {
      console.log(`[NETWORK]: Conectando para registrar sancion de ${alumnoId}...`);
      
      setTimeout(() => {
        const nuevaSancion: Sancion = {
          id: Date.now().toString(),
          alumnoId,
          profesorId,
          fecha: "hoy",
          tipo,
          descripcion
        };
        
        this.sancionesStorage.add(nuevaSancion);
        resolve();
      }, 2000);
    });
  }

  public comprobarConflictoProfesor(profesorId: string, dia: DiaSemana, franja: FranjaHoraria): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(`[NETWORK]: Verificando horarios del profesor ${profesorId}...`);
      
      setTimeout(() => {
        const todosLosHorarios = this.horariosStorage.getAll();
        const hayConflicto = todosLosHorarios.some(horario => 
          horario.profesorId === profesorId && 
          horario.dia === dia && 
          horario.franja === franja
        );
        
        resolve(hayConflicto);
      }, 2000);
    });
  }

  public obtenerInformeAlumno(alumnoId: string): Promise<{ faltas: number; retrasos: number; sanciones: number }> {
    return new Promise((resolve) => {
      console.log(`[NETWORK]: Generando informe para el alumno ${alumnoId}...`);
      
      setTimeout(() => {
        const todasLasAsistencias = this.asistenciaStorage.getAll();
        const todasLasSanciones = this.sancionesStorage.getAll();

        const asistenciasAlumno = todasLasAsistencias.filter(a => a.alumnoId === alumnoId);
        
        const resultado = {
          faltas: asistenciasAlumno.filter(a => a.estado === 'falta').length,
          retrasos: asistenciasAlumno.filter(a => a.estado === 'retraso').length,
          sanciones: todasLasSanciones.filter(s => s.alumnoId === alumnoId).length
        };

        resolve(resultado);
      }, 2000);
    });
  }
}