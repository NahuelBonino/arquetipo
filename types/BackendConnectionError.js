class BackendConnectionError extends Error {
 
  constructor(message, code) {
    super(message);
    this.name = "BackendConnectionError";
    this.erroresCodigo = code;
    this.erroresTextoPlano = "Sin conexión al servidor";
  }
}
export default BackendConnectionError;