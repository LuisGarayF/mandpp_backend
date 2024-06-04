# Instrucciones de Ejecución - Aplicación Mandpp Backend

Este repositorio contiene el código fuente para la aplicación Mandpp Backend, que utiliza Node.js y Oracle para proporcionar servicios de backend.

## Requisitos Previos

Antes de ejecutar la aplicación, asegúrate de tener instalado lo siguiente en tu sistema:

- Node.js (versión 12 o superior)
- Oracle Instant Client (para conectarse a la base de datos Oracle)

## Configuración del Entorno

1. Clona este repositorio en tu máquina local:

    ```
    git clone https://github.com/tu_usuario/mandpp_backend.git
    ```

2. Instala las dependencias del proyecto utilizando npm:

    ```
    cd mandpp_backend
    ```
    ```
    npm install
    ```
# Ejecución en Entorno de Desarrollo

Para ejecutar la aplicación en un entorno de desarrollo, sigue estos pasos:

1. Crea un archivo ``.env.development`` en el directorio raíz del proyecto, con la siguiente estructura:

    ```
    PORT=5001
    DB_USER=nombre_usuario
    DB_PASSWORD=contraseña
    DB_CONNECTION_STRING=hostname:puerto/servicio
    ORACLE_CLIENT_LIB_DIR=ruta_al_directorio_del_cliente_oracle
    ```

2. Ejecuta el siguiente comando para iniciar el servidor en modo de desarrollo:

    ```
    npm run dev
    ```
La aplicación se ejecutará en el puerto especificado en el archivo ``.env.development`` y estará lista para recibir solicitudes.

# Ejecución en Entorno de Producción

Para ejecutar la aplicación en un entorno de producción, sigue estos pasos:

1. Crea un archivo ``.env.production`` en el directorio raíz del proyecto, con la siguiente estructura:

    ```
    PORT=5001
    DB_USER=nombre_usuario
    DB_PASSWORD=contraseña
    DB_CONNECTION_STRING=hostname:puerto/servicio
    ORACLE_CLIENT_LIB_DIR=ruta_al_directorio_del_cliente_oracle
    ```
2. Ejecuta el siguiente comando para iniciar el servidor en modo de producción:

    ```
    npm start
    ```
La aplicación se ejecutará en el puerto especificado en el archivo .env.production y estará lista para recibir solicitudes.

# Cambio de Entorno

Para cambiar entre entornos de desarrollo y producción, modifica el valor de la variable de entorno ``NODE_ENV`` antes de ejecutar la aplicación.

*En entorno de desarrollo:*

    ```
    $env:NODE_ENV="development"
    ```
    ```
    npm run dev
    ```
*En entorno de producción:*

    ```
    $env:NODE_ENV="production"
    ```
    ```
    npm start
    ```
Asegúrate de ajustar los valores de las variables de entorno según tu configuración específica en los archivos ``.env.development`` y ``.env.production``.


