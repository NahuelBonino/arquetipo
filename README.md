# Arquetipo ReacjJS Material UI con NextJS 

Material UI version 5.15.15<br />
NextJS  14.2.2<br />
React 18.2.0<br />
Node version 18.20.2 o superior<br />
npm para las dependencias (no utilizar yarn)<br />


1. Copiar archivo ".env.local.example" y pegar con el nombre ".env.local". Acceder al nuevo archivo generado y configurar url del backend.
2. Instalar dependencias mediante: 
```
$ npm install
```
3. Ejecutar proyecto, mediante:
``` 
$ npm run dev
```

## Test unitarios
### Testing tools
  Jest (v 29.7.0)</br>
  React Testing Library (v 12.1.5)</br> </br>
Para ejecutar los test unitarios:
```
$ npm test
```
Si quieres ver los cambios realizados en modo watch:
```
$ npm test -- --watch
```
Si quieres saber el coverage:
```
$ npm test -- --coverage
```

## Estructura

Este Arquetipo invoca al backend de seguridad (ver arquetipo de seguridad backend) y por lo menos a otro backend que es el que contendrá la logica de negocio de la aplicación que se está desarrollando (por lo menos uno ya que se recomienda siempre una arquitectura basada en microservicios). 

Es multi-idioma utiliza ii18n y utilizamos Formik para los formularios

La estructura del arquetipo es :

**[ ] assets:** diseño<br />
**[ ] components:** Los componentes reutilizables, en custom ponemos los que pueden ser particulares del proyecto que estamos creando, ejemplo un componente para un formulario del proyecto<br />
**[ ] layout:** los layout utilizados, las paginas que tienen seguridad deben utilizar el Layout.General<br />
**[ ] lib:** los clientes a los backends, las utilidades y los services. Los services son logica adicional a los clientes en los backends, es cuando debemos invocar un backend y ponerle cierta logica a dicha invocación<br />
**[ ] hooks:** Los react hooks que creemos<br />
**[ ] types:** Los tipos que definamos, por ejemplo las exceptions<br />
**[ ] constants:** Las constantes que necesitamos, aqui existe un archivo que es el operations, donde debemos tener todas la operaciones de nuestro sistema con el mismo valor que el definido en seguridad backend<br />
**[ ] public:** en img las imagenes publicas logos etc, en locales para cada idioma los arhivos etiquetas.js y mensajes.js. En etiquetas.js ponemos los labels, las etiquetas de los formularios, titulos de paginas etc. EN mensajes todo lo que es indicarle algo al usuario luego que realizó una acción como guardar.

## Diseño

**Esta versión tiene detalles de diseño que se estará trabajando en las proximas semanas**

Diseño debe modificar:

 [ ] imagotipo.svg -  logo del sidebar cuando se colapasa<br />
 [ ] logotipo.svg -   logotipo del sidebar<br />
 [ ] favicon.png -  favicon<br />
 [ ] logotipo-azul.svg - logo que se usa en el login<br />
 [ ] bg-login.jpg - Imagen de fondo del login<br />
 [ ] bg-register.jpg- Imagen de fondo del registro de usuario si aplica<br />
 [ ] imagotipo-loader- Imagen cuando se encuentra cargando la pagina o los resultados de una busqueda<br />

Los estilos en general se deben modificar en:
 [ ] assets/css/cssmain.css

aunque en algun caso puede ser neecesario modificar los jss en:
 [ ] assets/jss/ 

El cual se puede leer en https://mui.com/styles/basics/

esta es la vieja forma de material ui el cual se disontinua, y siempre vamos a poner los estilso como css comunes. Pero existen componentes en el proyecto que todavía utilizan el jss

## BACKENDS

Para configurar el acceso a los backends se debe:

 [ ]  Modificar next.config.js agregando en  publicRuntimeConfig los backends faltantes<br />
 [ ]  Modificar env.local configurando propiamente dicho las URLS a los backends

 Al menos utilizará el seguridad backend (la configuración por defecto apunta a la utlima version de seguridad backend que se encuentra despegada en la nube de google) y logica backend (que apunta al ejemplo de logica que tambien se tiene en la nube de google)


## MENU

Para el menu se utiliza el componente Sidebar (componente colapsable), el cual se debe modificar las opciones en component/Sidebar

## IDIOMAS

Los idiomas se configuran en next-i18next.config.js y en public/locales debe exisitir una carpeta con los archivos etiquetas y mensajes para cada idioma definido

## Componentes

Este arquetipo contiene una lista de componentes los cuales utilizaremos en nuestro proyecto. En pages/app/abm se tienen ejemplos de su uso

###### SimpleTable

Ver uso en proveedoresSimpleTable.js

###### SimpleTableWithoutPagination

Similar a SimpleTable

###### SearchTable

Ver uso en proveedoresSearchTable.js

###### Address

Ver uso en proveedoresSimpleTable.js

###### MuiPhone

Ver uso en Address

###### CsvBulkUpload

Ver uso en proveedoresSimpleTable.js, si se pasa el limite se inserta y se procesa async sino se hace online. Si se hace async luego desde la funcionalidad tareas/excel se tiene el estado de ejecución
Debe exisitir las entidaes bulk las cuales tienen anotadas los campos, ver en el backend PorveedoresBulk

###### HistoricoDialog

Ver uso en configuraciones.js

###### HelpDialog

Ver uso en configuraciones.js

###### ABMImages

Ver uso en proveedores.js

Levanta las imagenes de forma temporal en el server utilizando 

apiFileClient que utliza la propiedad del .env NEXT_PUBLIC_BACKEND_API_URL para apuntar al backend

especificamente el servicio rest /v1/archivos/tmp/upload del resource ArchivoResource del arquetipo del backend. Luego cuando se confirma el formulario los almacena en el repositorio final.

Donde se almacena de forma temporal y final depende de la propiedad files.storage del backend que está en el application.properties


<pre><code>
#FILES FILESYSTEM or GOOGLE
files.storage=FILESYSTEM
#donde almacena los documentos confirmados
files.media.path=D://temp
#el directorio temportal que se deberia eliminar cada x tiempo
files.tmp.path=D://temp

En caso de ser google se almacenan en el storage de google configurado files.google.tmp.bucket y para los temporales y files.google.media.bucket para los confirmados
tambien para google hay que setear el service account que te da google que es un json y el id de proyecto de google

quarkus.google.cloud.service-account-location=C:/Users/Documents/Desarrollo/proyecto/archivos/proyecto-2c88518b91c2.json 

quarkus.google.cloud.project-id=id del proyecto google

</code></pre>

###### ABMDocumentos

Ver uso en proveedor.js

Tiene dos usos:

  1- Subir documentos temporales:
    Mantiene los documentos en memoria para enviarlos posteriormente junto con el Form de la página.

    Recordar incluirlos en el método para salvar el Form.

  2- Salvar documentos directamente en el server.

###### ABMVideos

Documentar 

###### DeleteDialog

Ver uso en SearchTable.js

###### AceEdit

Documentar 

###### ColorPicker

Documentar 

###### Sidebar

Ver uso en sidebar.js

###### MensajeComponent

Ver uso en proveedoresSimpleTable.js

###### Pais y estados

ver uso en Address.js

## MEJORAS IDENTIFICADAS
1. Posible utilización de la herramienta Eslint para la corrección automatizada de problemas estáticos en el código.  