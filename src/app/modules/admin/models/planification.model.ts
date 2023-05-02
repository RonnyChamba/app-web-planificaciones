
/**
 * Representa un resource de una planificación
 */
export interface  typeResource {
    url?: string;
    name: string;
    type: string
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