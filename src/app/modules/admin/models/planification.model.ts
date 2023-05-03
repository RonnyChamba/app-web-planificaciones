
/**
 * Representa un resource de una planificación
 */
export interface  typeResource {
    url?: string;
    name: string;
    type: string
}


/**
 * Representa una planificación de un docente subida al sistema que sera un campo de la colección de planificaciones
 */
export interface DataDetails {

    details_uid: string;
    teacher_uid: string;

}
export interface PlanificationModel {
    uid?: string;
    week: string;
    // esta fecha es netamente solo para visualizarla en el front
    dateCreated: string;
    status: boolean;
    deleted: boolean;
    title: string;
    details: string;
    resource: typeResource[];
    // esta fecha es para ordenar las planificaciones por fecha de creación
    timestamp?: number

    details_planification?: DataDetails[]
}

export interface DetailsPlanification{

    uid?: string;
    dateCreated?: string;
    status?: boolean;
    teacher?: any;
    observation?: string;
    planification?: string;
    resource?:any

}