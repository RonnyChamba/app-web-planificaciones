
export interface ModelBaseTeacher {
    uid?: string;
    displayName: string;
    dni: string;
    email?: string;
}


export interface ModelTeacher  extends ModelBaseTeacher{ 
    lastName?: string;
    password?: string;
    phoneNumber?: string;
    emailVerified?: boolean;
    photoURL?: string;
    titles?: string[];
    status?: boolean;
    rol?: string;
    
}

