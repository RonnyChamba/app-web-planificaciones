import {
    MAX_ADDRESS,
    MAX_DESCRIPTION,
    MAX_EMAIL,
    MAX_NAME,
    MAX_PASSWORD,
    MAX_TELEPHONE,
    MIN_CEDULA,
    MIN_EMAIL,
    MIN_NAME,
    MIN_PASSWORD,
  } from './constantes-values';
  
  /**
   * Función donde se define un objeto con los mensajes de error para las validaciones
   *
   */



  const getMessagesNameAndLastName = (type: string) => {

   return  [
      {
        type: 'required',
        message: `${type} es obligatorio.`,
      },
      {
        type: 'minlength',
        message: `Ingrese minímo ${MIN_NAME} caracteres.`,
      },
      {
        type: 'maxlength',
        message: `Solo puede ingresar hasta ${MAX_NAME} caracteres.`,
      },
    ]
  
  }


      
  export const validMessagesError = {
    


  
    requerid :  [
      {
        type: 'required',
        message: 'Campo obligatorio.',
      },
    ],
    
    cedula: [
      {
        type: 'required',
        message: 'Cédula es obligatoria.',
      },
      {
        type: 'pattern',
        message: `Ingrese ${MIN_CEDULA} números.`,
      },
    ],
  
    nombres: getMessagesNameAndLastName('Nombres'),
    apellidos: getMessagesNameAndLastName('Apellidos'),

    address: [
      {
        type: 'maxlength',
        message: `Solo puede ingresar hasta ${MAX_ADDRESS} caracteres.`,
      },
    ],
  
    password: [
      {
        type: 'pattern',
        message: 'La contraseña debe tener una letra mayúscula.',
      },
      {
        type: 'required',
        message: 'Contraseña es obligatoria.',
      },
      {
        type: 'minlength',
        message: `Ingrese minimo ${MIN_PASSWORD} caracteres.`,
      },
      {
        type: 'maxlength',
        message: `Solo puede ingresar hasta ${MAX_PASSWORD} caracteres.`,
      },
    ],
  
    repeatPassword: [
      {
        type: 'required',
        message: 'Campo es obligatorio.',
      },
    ],
  
    correo: [
      {
        type: 'pattern',
        message: `Formato email es incorrecto.`,
      },
      {
        type: 'maxlength',
        message: `Solo puede ingresar hasta ${MAX_EMAIL} caracteres.`,
      },
    ],
    celular: [
      {
        type: 'pattern',
        message: `Debe ingresar ${MAX_TELEPHONE} números`,
      },
    ],
    born: [
      {
        type: 'pattern',
        message: `Formato fecha incorrecto`,
      },
    ],
  
    description: [
      {
        type: 'required',
        message: `Campo obligatorio`,
      },
      {
        type: 'maxlength',
        message: `Descripción puede ingresar hasta ${MAX_DESCRIPTION} caracteres.`,
      },
    ],
  
    // Valor de campo gastos e diarios
    price: [
      {
        type: 'pattern',
        message: `Formato incorrecto.`,
      },
      {
        type: 'required',
        message: `Campo obligatorio.`,
      },
    ],
    amount: [
      {
        type: 'pattern',
        message: `Formato incorrecto.`,
      },
      {
        type: 'required',
        message: `Campo obligatorio.`,
      },
    ],
    dateBegin: [
      {
        type: 'pattern',
        message: `Formato fecha incorrecto`,
      },
    ]
  };
  
  
  
  
  