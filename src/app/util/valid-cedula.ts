export const validCedula = (cedula: string) => {
    if (!cedula.match('^[0-9]{10}$'))
      return { status: false, message: 'La cédula debe tener 10 números' };
      
    if (!validProvinceCode(cedula.substring(0, 2)))
      return {
        status: false,
        message:
          'Codigo de Provincia (dos primeros dígitos) debe estar entre 0 y 24',
      };
  
    if (!validTercerDigite(cedula.substring(2, 3)))
      return {
        status: false,
        message: 'Tercer dígito debe estar entre  0 y 5',
      };
  
  
      if (!algoritmoModulo10(cedula))  
      return {
          status: false,
          message: 'Cédula incorrecta',
        };
  
   return {
      status: true,
      message: 'Cédula correcta',
    };
  ;
  };
  
  const validProvinceCode = (provinceCode: string) => {
    let code = parseInt(provinceCode);
  
    return code >= 0 && code <= 24;
  };
  
  const validTercerDigite = (digite: string) => {
    let code = parseInt(digite);
  
    return code >= 0 && code <= 5;
  };
  
  const algoritmoModulo10 = (cedula: string) => {
    const digites = cedula.split('').map((item) => parseInt(item));
  
    const arrayCoeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  
    let total = 0;
  
    digites.forEach((valuePosition, index) => {
      if (index < arrayCoeficientes.length) {
        valuePosition = valuePosition * arrayCoeficientes[index];
  
        if (valuePosition >= 10) {
          let valueSplit = valuePosition
            .toString()
            .split('')
            .map((item) => parseInt(item));
  
          valuePosition = valueSplit[0] + valueSplit[1];
        }
  
        total = total + valuePosition;
      }
    });
  
    let residuo = total % 10;
    let resultado = residuo == 0 ? 0 : 10 - residuo;
  
    // Obtener el ultimo digito de la cedula y comparar con el resultado 
    return digites[9] == resultado
  };
  
  // console.log(validCedula('131364689134'));
  