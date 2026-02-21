Proyecto Gestion de Opiniones Joab Regil

--Levantar Proyecto

1. Agregar sus variables de entorno en el docker-compose.
2. Instalacion dependencias: pnpm install.
3. Creacion de contenedor Docker: docker-compose up -d.
4. Creacion de base de datos postgresSQL a base del componente docker.
5. Levantar el proyecto: pnpm run dev

Funcionalidad del proyecto

• Instrucciones de uso

-- (REGISTRAR CUENTA)
Registrar una cuenta nueva en endpoint postman (POST - REGISTER) => (Agregar surname, username, email, password, phone, profilePicture). El correo puede ser uno de usted para que le llegue la verificación.

-- Verificar la cuenta (POST - VERIFY-EMAIL)
Para verificar el correo se pone el token que se le envió al correo electrónico que puso en el registrar y ya le da send y verifica su correo. Sin la verificacion no podra iniciar sesion.

-- Para Iniciar Sesión (POST - LOGIN)
Ya cuando haya registrado y verificado el correo ya podrá iniciar sesión. En el Login tendrá que poner los datos que puso en el registrar el correo electrónico y la contraseña, ya poniendo esos parámetros ya podrá iniciar sesión. 

-- Para reenviar la verificacon (POST - RESEND -VERIFICATION)
Para que le reenvíen la verificación solo tiene que poner el correo que puso en el login y en el registrarse ósea que seria el mismo. ya poniendo el correo le da send y le vuelve a enviar la verificación.

-- Para cambiar la contraseña por si se le olvida la contraseña (POST - RESET-PASSWORD)
Para que pueda cambiar la contraseña del correo tiene que poner el token del correo que le dio en el login del postman, pone el token la nueva contraseña y le da send y ya se le cambia la contraseña.

-- Por si se le olvido su contraseña (POST - FORGOT-PASSWORD)
En este endpoint solo tiene que poner el correo electrónico que viene usando y ahi le envía un correo para poder recuperar la contraseña.

-- Listar Usuarios (GET - USERS-LIST)
Aquí solo lista los usuarios que se van registrando y van iniciando sesión. 

-- Obtener Perfil Propio (GET - Obtener Perfil Propio)
Aqui solo aparecen los datos del usuario, como nombre, correo, etc.

-- Obtener Roles de User (GET)
En este apartado tiene que poner el id del usuario osea del suyo, ese id se pone en la URL de postman(http://localhost:3005/api/v1/users/{{user_id}}/roles) y pone el token de verificacion que se genera a la hora que inicia sesion y ya ahi le aparece que rol tiene su usuario.

-- Obtener Perfil por ID (POST)
En este apartado tendra que poner el id del usuario, este id se genera a la hora que usted haya iniciado sesion, ya poninedo ese ID ya le aparece el usuario que usted haya generado, solo con el ID le aparecen los datos de los usuarios.

-- Actualizar Rol de User (PUT) (solo admin)
Aqui solo el administrador podra cambiar el rol, (http://localhost:3005/api/v1/users/{{user_id}}/role), aqui usted pone el id del usuario y ya en el body usted pone si quiere ADMIN_ROLE o ADMIN_USER.

------------------------------------------- ENTIDADES -----------------------------------------------------------------------------------

(PUBLICACIONES)

1. Agregar una Publicacion (POST)
Aqui usted llena los campos y pone el token de verificacion, siempre es el que aparece a la hora que usted le logea. 
Categorías disponibles: GENERAL, TECNOLOGIA, DEPORTES, ENTRETENIMIENTO, CIENCIA, POLITICA, SALUD, EDUCACION u OTRO.

2. Obtener las Publicaciones (GET)
Aqui solo le apareceran todas las publicaciones que el usuario ha hecho.

3. Obtener Post por categoria (GET)
En este apartado solo apareceran las publicaciones que esten usando la categoria deseada, y la categoria de cambia en el URL del postman
http://localhost:3005/api/v1/posts?category=TECNOLOGIA&page=1&limit=10

4. Obtener Post por ID (GET)
En este apartado usted tiene que poner el id de la publicacion, este id se puede ver a la hora que usted haya creado una publicacion en dado caso no podra ver nada, ya cuando haya puesto el id de la publicacion ya podra ver solo esa publicacion.

5. Obtener Publicaciones de un Usuario (GET)
En este apartado usted podra ver las publicaciones que tiene los usuarios solo con el ID del usuario, el ID del usuario lo podra ver en el apartado del Login. Ya poniendo el id ya podra ver las publicaciones que tiene los usuarios.

6. Actualizar Publicación (solo autor) (PUT)
Aqui solo el autor podra editar su publicacion, en la URL tendra que poner el id de la publicacion y el token(Este se mira en el login), ya poniendo esos parametros usted ya podra editar su publicacion. 

7. Eliminar Publicación (solo autor) (DELETE)
En este apartado solo el auto podra eliminar sus publicaciones en dado caso otro usuario quiera eliminar no lo dejara, aqui tendra que poner el ID de la publicacion y el token generado en el login, ya haciendo eso el usuario podra eliminar las publicaciones que el quiera.

(COMENTARIOS)

1. Agregar Comentario (POST)
Aqui el usuario Agrega y llena los campos requeridos, en el post del ID el usario tiene que poner el ID de la publicaciones que desea comentar y pone el token generado en el login para que se pueda agregar el comentario a esa publicacion.

2. Obtener Comentarios de una Publicacion (GET)
En este apartado el usuario tendra que poner el ID de la publicacion en la URL del postamn (http://localhost:3005/api/v1/comments/post/{{post_id}}?page=1&limit=20) ya poniendo el ID, el usuario tendra que poner el token generado en el login para que lo deje ver todas las publicaciones de los usuarios.

3. Actualizar Comentario (solo el autor) (PUT)
En este apartado tendra que poner el ID del comentario (URL del Endpoint) que genero y el token de autenticacion generado en el login, ya poniendo esos paramentros usted podra editar el comnetario de lo contrario no lo dejara.

4. Eliminar comnetario (solo el autor) (DELETE)
Aqui podra eliminar los comentarios que el usuario genero, solo con el ID del comentario este se pone en la URl del endpoint y pone el token generado en el login, ya se podra eliminar los comnetarios.

(LIKES)

1. Dar Like a una Publicación (POST)
Aqui solo tendra que poner el id de la publicacion que ustede desea dar like(Este ID se puede ver a la hora que usted haya creado una publicacion), y pone el token y ya con eso se le dara like a una publicacion.

2. Quitar Like de una Publicación (DELETE)
Aqui tendra que poner el ID de la publicacion en la URL del Endpoint y el token y automaticamente se estara quitando el like a esa publicacion.

3. Verificar si el Usuario Dio Like (GET)
Aqui tendra que poner el ID de la publicacion en la URL del Endpoint y el token y ya se le genera un listado que cuantos likes tiene su publicacion.

4. Obtener Usuarios que Dieron Like (GET)
Aqui tendra que poner el la URL del Endpoint el ID de la publicacion que usted desea ver que usuarios le dieron like a esa publicacion. Solo pone el ID en la URl y el token y se le genera el listado de los usuarios que le dieron like a esa publicacion.

--------------------- Datos Extra ---------------------
El token se pone en Authorization: Bearer Token {{token}}
