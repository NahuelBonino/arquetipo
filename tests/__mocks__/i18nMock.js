export const i18mMock =  jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
  serverSideTranslations: () => ({}),
  withTranslation: () => (Component) => (props) => <Component t={() => ''} {...props} />,
  // Otras funciones o módulos necesarios para tus pruebas
}));

