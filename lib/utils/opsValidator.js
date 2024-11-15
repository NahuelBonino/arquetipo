let currentOperations;

const isTokenValid = () => {
  let token = localStorage.getItem("token");
  if (!token) {
    return false; //No hay token
  }
  //False si el token está vencido
  let tokenData = JSON.parse(Buffer.from(token.split(".")[1], 'base64'));
  return Date.now() <= tokenData.exp * 1000;
};

const userHasRequiredOperation = (requiredOperation) => {
  if (requiredOperation == null) {
    return true;
  }

  const lso = localStorage.getItem("operations");
  if (lso != null) {
    currentOperations = JSON.parse(lso);
  }
  
  if (currentOperations != null) {
    return currentOperations.some(
      (operation) => operation == requiredOperation
    );
  }

  return false;
};

const clearOperations = () => {
  currentOperations = null;
};

export { clearOperations, isTokenValid, userHasRequiredOperation };

