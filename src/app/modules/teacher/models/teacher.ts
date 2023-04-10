
export interface ModelBaseTeacher {
    uid?: string;
    displayName: string;
    dni: string;
}


export interface ModelTeacher  extends ModelBaseTeacher{ 
    lastName?: string;
    password?: string;
    email: string;
    phoneNumber?: string;
    emailVerified?: boolean;
    photoURL?: string;
    titles?: string[];
    
}

