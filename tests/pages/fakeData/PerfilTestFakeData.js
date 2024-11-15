import { faker } from "@faker-js/faker";

const responseDataTotalOfRegisters = 1;

const usuPrimerNombre = faker.person.firstName();
const usuPrimerApellido = faker.person.lastName();

const lastModUserFisrtName = faker.person.firstName();
const lastModUserFisrtLastName = faker.person.lastName();

const responseDataCurrentUser = {
  usuId: faker.number.int(100),
  usuEmail: faker.internet.email(),
  usuHabilitado: true,
  usuEmailVerificado: true,
  usuAceptaTerminos: true,
  usuPrimerNombre: usuPrimerNombre,
  usuSegundoNombre: faker.person.firstName(),
  usuPrimerApellido: usuPrimerApellido,
  usuSegundoApellido: faker.person.lastName(),
  usuDocument: faker.string.numeric(8),
  usuTmpUploads: 0,
  usuRoles: null,
  auditData: {
    lastModDateTime: faker.date.past(),
    lastModUser: {
      usuId: 1,
      usuEmail: faker.internet.email(),
      usuHabilitado: true,
      usuPrimerNombre: lastModUserFisrtName,
      usuPrimerApellido: lastModUserFisrtLastName,
      usuNombreBusqueda: `${lastModUserFisrtName} ${lastModUserFisrtLastName}`,
      usuVersion: 0,
      nombreYApellido: `${lastModUserFisrtName} ${lastModUserFisrtLastName}`,
    },
  },
  usuVersion: 0,
  nombreYApellido: `${usuPrimerNombre} ${usuPrimerApellido}`,
};

const responseDataLastAccess = {
  audId: faker.number.int(100),
  audIp: faker.internet.ipv4(),
  audFecha: faker.date.past(),
};

export {
  responseDataTotalOfRegisters,
  responseDataCurrentUser,
  responseDataLastAccess,
};
