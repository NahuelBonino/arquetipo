class BusinessError extends Error {

  constructor(message, data) {
    super(message);
    this.name = "BusinessError";
    this.message = data.message;
    this.erroresCodigo = data.errores;
    this.erroresTextoPlano = data.erroresTextoPlano;
  }
}
export default BusinessError;

