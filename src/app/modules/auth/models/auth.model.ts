export interface AuthModel {
    username: string;
    password: string;
}

export interface AuthCredential{
    uid: string;
    email: string;
    rol?: any;
}