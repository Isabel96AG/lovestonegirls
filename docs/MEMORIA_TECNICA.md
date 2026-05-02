# Memoria del proyecto

Este documento recoge el desarrollo de la aplicación que he construido como TFG: una **tienda online de ropa de segunda mano para mujer** que he llamado *LoveStonedGirls*. No es un manual de uso; lo planteo más bien como un diario técnico, donde explico el orden en que fui haciendo las cosas, qué probé, qué descarté y por qué. He intentado dejar también constancia de los errores que me bloquearon durante horas, porque creo que son la parte que más se aprende y la que más se olvida después.

El proyecto se compone de tres carpetas que viven en el mismo repositorio pero funcionan como aplicaciones independientes: una API en Laravel, un panel de administración en Angular usando la plantilla Metronic, y una tienda pública también en Angular partiendo de la plantilla Shofy. La idea era separar bien las responsabilidades desde el principio.

---

## 1. Por qué este proyecto y qué me proponía

Llevaba tiempo queriendo hacer algo "de verdad" en lugar de los típicos ejercicios de clase. Un ecommerce me parecía un ejemplo razonable porque toca casi todos los temas importantes de desarrollo web: autenticación, base de datos, comunicación entre servicios, diseño responsive, gestión de roles, envío de emails, etc. Y porque, si algún día quiero seguir aprendiendo por mi cuenta, sirve como base para añadir cosas (carrito, pasarela de pago, recomendaciones).

Pero quería que fuera un proyecto con identidad propia, no una "tienda genérica" más. Por eso lo enfoqué a un nicho concreto: **ropa de segunda mano para mujer**. La elección no es casual. Por un lado, las plataformas como Vinted o Wallapop demuestran que es un mercado en crecimiento real, vinculado a la conciencia de **economía circular** y consumo sostenible. Por otro, es un dominio cercano a mi día a día y eso me permitía tomar decisiones de diseño con criterio (qué categorías son las que más se buscan, qué información necesita ver una compradora, etc.) en lugar de inventarme un sistema en abstracto.

A nivel de catálogo decidí trabajar con dos grandes departamentos: **Ropa** (camisetas, vestidos, pantalones, faldas, sudaderas, abrigos, jerseys) y **Accesorios** (bolsos, joyería, cinturones, gafas), con subcategorías cuando aporta (por ejemplo, dentro de Vestidos: largos, cortos, midi). Es un catálogo deliberadamente acotado, porque para un TFG con plazo limitado prefería resolver bien lo esencial antes que abrir mil categorías que luego se quedaran vacías.

Mi objetivo nunca fue terminar una tienda lista para producción —sé que eso requiere meses de trabajo, integración con pasarelas de pago reales y bastante validación legal—, sino construir un MVP funcional donde la pieza central, la autenticación con JWT entre tres aplicaciones distintas y la gestión jerárquica del catálogo de productos, estuviera bien resuelta y verificable.

---

## 2. Tecnologías que elegí (y otras que descarté)

Para el backend opté por **Laravel 12**. Conocía Laravel de prácticas y me daba seguridad: tiene Eloquent como ORM, una capa de validación muy cómoda y, sobre todo, un sistema de migraciones que evita tener que tocar phpMyAdmin a mano cada vez que cambia el modelo de datos. Pensé en Symfony, pero la curva de aprendizaje extra no me compensaba para el tiempo del que disponía. Express con Node lo descarté porque quería practicar PHP, que es lo que más me ha pedido el mercado en las ofertas que he ido mirando.

Para los dos frontends elegí **Angular 17**, también porque era el framework que más había tocado durante el grado. La versión 17 introduce los *standalone components*, que evitan tener que andar declarando módulos por todas partes. La verdad es que al principio me costó pillar el cambio respecto a los `NgModule` de versiones anteriores —los tutoriales de YouTube todavía usan la sintaxis vieja y lía bastante—, pero tras un par de días con la documentación oficial me di cuenta de que es bastante más limpio.

La base de datos es **MySQL**, gestionada localmente con XAMPP. No tenía mucho sentido complicarme con PostgreSQL para un proyecto local, y MySQL es más estándar en hostings compartidos por si en algún momento subo el proyecto.

Para la autenticación dudé bastante entre **Laravel Sanctum** y **JWT**. Sanctum es lo "oficial" de Laravel ahora mismo, pero está más pensado para apps SPA que comparten dominio con la API o usan cookies. Como yo iba a tener tres aplicaciones en puertos distintos (8000 para la API, 4200 para la tienda y 4201 para el admin), las cookies se complican mucho con el CORS. JWT, al ser stateless y viajar en el header `Authorization`, encajaba mejor. Me decidí por el paquete `tymon/jwt-auth`, que es el más mantenido para Laravel.

Para las notificaciones tipo "toast" (los avisitos que aparecen en una esquina) usé **ngx-toastr**, que es la librería más popular en Angular. Tuve un problema con la versión, pero lo cuento más adelante.

Para los emails, configuré **SMTP de Gmail** con una App Password. Es gratis, suficiente para desarrollo, y una vez está configurado funciona sin sustos. En producción usaría algo como Mailgun o Sendgrid, pero para el TFG era exagerado.

---

## 3. Estructura del proyecto

```
lovestonedgirls/
├── api_ecommerce/          ← Laravel 12 (backend, puerto 8000)
├── admin_metronic_8.2/     ← Angular 17 con Metronic (puerto 4201)
├── ecommerce/              ← Angular 17 con Shofy (puerto 4200)
└── docs/                   ← esta memoria y las notas
```

Las tres aplicaciones se comunican únicamente por HTTP/JSON. La API no sabe nada de quiénes son sus clientes; los frontends podrían ser otros, o podría haber una app móvil consumiéndola, sin tener que cambiar ni una línea del backend. Esa separación me parece importante señalarla porque es lo que hace que esta arquitectura se considere "headless".

La autenticación funciona así: el usuario se loguea desde el frontend, el backend devuelve un token JWT firmado con HS256, el frontend lo guarda en `localStorage` y lo envía en cada petición posterior dentro del header `Authorization: Bearer <token>`. El backend valida la firma y la fecha de caducidad sin necesidad de mantener ninguna sesión.

---

## 4. Implementación, paso a paso

### 4.1 Lo primero: dejar la base de datos conectada

Empecé clonando una base de proyecto Laravel y, tras correr `php artisan migrate`, me llevé el primer chasco: error de conexión a la base de datos. Después de un rato perdida descubrí que en Laravel 11 (y 12) el `.env` por defecto trae `DB_CONNECTION=sqlite`. Lo cambié a `mysql`, ajusté las variables de host, puerto, base de datos, usuario y contraseña, y la conexión funcionó a la primera. También me di cuenta de que en la línea de `DB_PORT` se había colado un espacio inicial que rompía el parsing —algo aparentemente trivial pero que vuelve loca a cualquiera buscando.

Una vez la conexión iba, lancé las migraciones iniciales. Laravel crea por defecto las tablas `users`, `password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches` y `failed_jobs`. La de `users` es la única que iba a usar al principio, pero las demás vienen "gratis" y conviene dejarlas porque alguna feature de Laravel las necesita internamente.

### 4.2 Instalar JWT y dejarlo funcionando

Instalé `tymon/jwt-auth` con composer. Después publiqué la configuración con `php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"`, lo que me creó un `config/jwt.php` donde se definen cosas como el TTL del token (lo dejé en 60 minutos por defecto), el algoritmo de firma (HS256) y el TTL del refresh.

El siguiente paso fue generar la clave secreta con `php artisan jwt:secret`, que añade automáticamente `JWT_SECRET=<cadena_larga>` al `.env`. Esa clave es la que firma todos los tokens, así que si la cambias, los tokens emitidos antes dejan de servir. La incluí en el `.gitignore` (heredado del `.env`) para que no se subiera nunca al repositorio.

### 4.3 Modelo `User` y configuración del guard

Aquí tuve que tocar dos cosas. Primero, hacer que el modelo `User` implemente la interfaz `Tymon\JWTAuth\Contracts\JWTSubject`, que obliga a definir dos métodos:

```php
public function getJWTIdentifier()
{
    return $this->getKey();
}

public function getJWTCustomClaims()
{
    return [];
}
```

El primero devuelve el `id` del usuario, que viajará dentro del payload del token como `sub` (subject). El segundo permitiría meter claims personalizados —por ejemplo, el rol del usuario—, pero para simplificar lo dejé vacío.

Segundo, configurar el guard `api` en `config/auth.php` para que use el driver `jwt`:

```php
'api' => [
    'driver' => 'jwt',
    'provider' => 'users',
],
```

A partir de ese momento, llamando a `auth('api')` o `Auth::guard('api')` en cualquier sitio del backend, obtenía el `JWTGuard` correcto. Aprendí por las malas que llamar a `Auth::factory()` sin especificar guard daba error: por defecto Laravel devuelve el `SessionGuard`, que no tiene ese método. Una hora perdida hasta que entendí por qué.

### 4.4 El controlador de autenticación

El `AuthController` es el corazón del backend. Tiene los siguientes métodos:

- `register()` — crea un usuario nuevo con `type_user = 2` (cliente), genera un `uniqid()` único y dispara el envío del email de verificación.
- `login()` — autentica administradores. Filtra por `type_user = 1` en el `attempt()`.
- `login_ecommerce()` — autentica clientes. Filtra por `type_user = 2` y, además, comprueba que el campo `email_verified_at` no sea `null` antes de devolver el token.
- `me()` — devuelve los datos del usuario que está autenticado en ese momento.
- `logout()` — invalida el token actual.
- `refresh()` — emite un token nuevo a partir de uno todavía válido.
- `respondWithToken($token)` — método interno auxiliar que construye la respuesta JSON estándar (token, tipo, tiempo de expiración y datos del usuario).

La validación de los datos en `register` la hago con `Validator::make()`, exigiendo `name`, `surname`, `phone`, `email` único y `password` de mínimo 8 caracteres. Si la validación falla, devuelvo un 400 con el detalle de los errores en formato JSON. La contraseña la almaceno hasheada con `bcrypt()`, que es el algoritmo recomendado por Laravel para passwords y resistente a ataques de fuerza bruta porque está diseñado para ser deliberadamente lento.

### 4.5 Las rutas: una sorpresa que me costó entender

Cuando fui a definir las rutas, descubrí que el archivo `routes/api.php` no existía. Pensé que se me había borrado por accidente o que el repo estaba mal. Después de leer un rato encontré que en Laravel 11+ ese archivo ya no se crea por defecto: si no haces APIs no lo necesitas, así que han dejado solo `web.php` y `console.php`.

Hay dos formas de añadirlo. La primera es ejecutar `php artisan install:api`, que crea el archivo, lo registra en `bootstrap/app.php` y, además, instala Sanctum. Como yo no quería Sanctum (estaba usando JWT), opté por la segunda: crear manualmente el archivo `routes/api.php` y editar el `bootstrap/app.php` para añadir la línea:

```php
api: __DIR__.'/../routes/api.php',
```

dentro del `withRouting()`. Más limpio para mi caso.

Otra cosa con la que me topé fue que el patrón clásico de poner el middleware en el constructor del controlador, así:

```php
public function __construct() {
    $this->middleware('auth:api', ['except' => ['login', 'register']]);
}
```

ya **no funciona en Laravel 11+**. El método `$this->middleware()` se eliminó. La forma actual es aplicar el middleware en las rutas mediante un grupo:

```php
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', ...);
    Route::post('/me', ...);
});
```

Tardé un buen rato en encontrar esto en la documentación de upgrade. Es de esos cambios que rompen la compatibilidad con la mayoría de tutoriales de YouTube.

### 4.6 El frontend: AuthService y conexión con el backend

En la parte de Angular, lo primero fue crear un servicio `AuthService` que centralizara todo lo relacionado con la autenticación. Inyecta `HttpClient` para hablar con la API y `Router` para redirigir entre páginas. Tiene los métodos `login`, `register`, `logout`, `saveLocalStorage` y un `initAuth` que se llama desde el constructor para recuperar el token y los datos del usuario si ya estaban guardados de una sesión anterior.

Para no repetir la URL de la API por todos lados, la centralicé en un archivo `src/app/config/config.ts` que importa las constantes desde `environments/environment.ts`. Así, si en producción cambia el dominio, solo toco un sitio. El nombre de la constante (`URL_SERVICIOS`) lo escribí en plural en lugar de en singular porque era el que pedía el tutorial que estaba siguiendo —no es una decisión técnica, es una concesión a la coherencia del material que utilizaba.

El método `login` no es una llamada HTTP "pelada", sino que pasa la respuesta por un `pipe(map(...), catchError(...))` de RxJS. El `map` me permite transformar la respuesta antes de devolverla al componente: si trae `access_token`, llamo a `saveLocalStorage` para persistirlo y devuelvo `true`; si no, devuelvo `false`. El `catchError` captura cualquier fallo HTTP y lo convierte en un valor del observable, evitando que la promesa se quede colgada.

Los componentes de login y register son standalone y declaran `FormsModule` en sus `imports`. Esto es necesario para poder usar `[(ngModel)]` en los inputs del formulario, algo que en versiones anteriores de Angular venía heredado del `AppModule`. Si se te olvida, sale un error confuso de "Can't bind to 'ngModel' since it isn't a known property" que al principio no relacionas con que falta importar el módulo.

### 4.7 Notificaciones con ngx-toastr

Las notificaciones tipo toast son ese mensajito de "Login correcto" o "Email duplicado" que aparece en una esquina y se va solo. Son mucho más amigables que un `alert()` y no bloquean la interacción.

Al instalarlo me dio un error de dependencia (`ERESOLVE`) porque la última versión de la librería (v20) requiere Angular 21, y mi proyecto está en Angular 17. La solución no fue forzar la instalación con `--force` ni `--legacy-peer-deps` (que es lo que sugiere el propio mensaje de error), sino instalar la versión correcta para Angular 17, que es la **18.x**:

```bash
npm install ngx-toastr@^18 --save
```

Las dependencias de Angular son muy estrictas y forzarlas suele acabar en errores raros en runtime difíciles de diagnosticar. Mejor instalar la versión adecuada desde el principio.

Para que las notificaciones se vean, en `app.config.ts` registré los providers necesarios:

```typescript
providers: [
    provideRouter(routes),
    provideAnimations(),
    provideToastr(),
    provideHttpClient(),
]
```

`provideAnimations` es obligatorio porque toastr usa transiciones para aparecer y desaparecer. `provideHttpClient` lo añadí cuando me di cuenta de que sin él, mi `AuthService` daba `NullInjectorError: No provider for HttpClient!` al intentar hacer cualquier petición. Es uno de esos providers que en proyectos antiguos venía implícito con el `AppModule` pero ahora hay que registrar a mano.

Y el CSS de toastr lo añadí al `angular.json`:

```json
"styles": [
    "src/styles.css",
    "node_modules/ngx-toastr/toastr.css"
]
```

Después de cambiar `angular.json` hay que parar y reiniciar `ng serve` para que coja la nueva configuración: el hot reload no detecta cambios en ese archivo.

### 4.8 Verificación de email

Esta parte fue de las más entretenidas porque toca varios puntos a la vez: SMTP, plantillas de email, modificación de la BD y lógica del login.

Configurar Gmail tuvo más miga de la que esperaba. Google ya no permite el "acceso de aplicaciones menos seguras" desde 2022, así que toca usar **App Passwords**. Para eso tienes que tener activada la verificación en 2 pasos, y luego puedes generar una contraseña de 16 caracteres exclusiva para esa aplicación. Esa contraseña va al `.env`, no la real de tu cuenta. Lo configuré así:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=lovestonedproyecto@gmail.com
MAIL_PASSWORD=<la_app_password>
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=lovestonedproyecto@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

Después generé la clase Mailable con `php artisan make:mail VerifiedMail`. Modifiqué el constructor para que reciba el `$user` y lo guarde como propiedad pública. Una particularidad de Laravel: las propiedades públicas de los Mailables se inyectan automáticamente en la vista Blade, así que dentro de la plantilla puedo usar `{{ $user->name }}` directamente, sin pasar nada explícitamente.

La plantilla `verifiedmail.blade.php` la basé en una plantilla HTML responsive que ya tenía pensada para el ecommerce, y dentro pegué el botón de verificación apuntando a:

```
{{ env("URL_TIENDA")."login?code=".$user->uniqd }}
```

Donde `URL_TIENDA` es una variable de entorno que apunta a `http://localhost:4200/`. Al usuario le llega un correo con un botón rosa que, al pulsarlo, lo lleva de vuelta al frontend con el código de verificación como parámetro de query string en la URL.

> Aprendí por las malas la importancia del `?` versus el `&`: en mi primera versión usé `&code=` (porque el tutorial lo tenía así), y aunque la URL parece válida, Angular **no la lee como query string** — `queryParams` solo detecta parámetros que vienen después del `?`. Hice varias pruebas registrando usuarios reales antes de darme cuenta de que el botón del correo me llevaba a la página correcta pero sin que se procesara nada. Cambié `&` por `?` y pasó a funcionar al instante.

Para que el sistema sepa qué usuarios están verificados y cuáles no, añadí al modelo `User` el campo `uniqd` en `$fillable`. La columna `email_verified_at` ya existía en la tabla `users` (Laravel la incluye en la migración inicial). En el método `register` del controlador genero el código con `uniqid()` antes de guardar el usuario, y en `login_ecommerce` añadí esta comprobación al final:

```php
if (! auth('api')->user()->email_verified_at) {
    auth('api')->logout();
    return response()->json(['error' => 'Debes verificar tu correo electrónico'], 403);
}
```

Si el campo está null, hago logout del guard (para que el token recién generado no sirva) y devuelvo un 403. En el frontend, esto se traduce en un toast de "Credenciales incorrectas" porque mi código no diferencia todavía 401 de 403, algo que afinaría en una próxima iteración.

#### 4.5.5 El endpoint de verificación

Para cerrar el ciclo, añadí un endpoint público en el `AuthController`:

```php
public function verified_auth(Request $request)
{
    $user = User::where("uniqd", $request->code_user)->first();
    if ($user) {
        $user->update(["email_verified_at" => now()]);
        return response()->json(["message" => 200]);
    }
    return response()->json(["message" => 403]);
}
```

Es deliberadamente sencillo: busca al usuario cuyo `uniqd` coincide con el código que llega del frontend, y si lo encuentra, marca `email_verified_at` con la fecha y hora actual. Si no lo encuentra (código inválido o ya consumido), devuelve un código 403 dentro del cuerpo JSON. Lo registré en `routes/api.php` **fuera del grupo `auth:api`** porque el usuario aún no tiene token cuando hace click en el correo.

En el frontend, el `ngOnInit` de `LoginComponent` lee el `code` de la URL mediante `ActivatedRoute.queryParams` y, si existe, llama al endpoint y muestra un toast de éxito o error según la respuesta. El usuario no tiene que hacer nada más allá de abrir su correo y pulsar el botón.

### 4.6 Validaciones de entrada

Algo que aprendí pronto es que las validaciones tienen que estar **en los dos lados** y nunca confiar en uno solo. El frontend valida primero para no hacer peticiones HTTP innecesarias y dar feedback inmediato al usuario, pero el backend valida también porque un atacante puede saltarse el JavaScript y llamar directamente a la API con curl o Postman.

En el `register` del backend uso el `Validator` de Laravel con reglas razonables y mensajes en español personalizados:

```php
$validator = Validator::make(request()->all(), [
    'name' => 'required|string|min:2|max:50',
    'surname' => 'required|string|min:2|max:100',
    'phone' => 'required|digits:9',
    'email' => 'required|email|max:100|unique:users',
    'password' => 'required|string|min:8|max:50',
], [/* mensajes en español */]);
```

Decidí exigir 9 dígitos exactos en el teléfono porque es el formato español. Si el día de mañana se internacionaliza la tienda, sería cuestión de cambiar la regla por una expresión regular más laxa (`+34 600...`).

En el frontend hago una validación en cascada: si un campo está vacío, salgo con un toast genérico; si tiene contenido pero el formato es inválido (email mal formado, teléfono no numérico, contraseña corta), salgo con un mensaje específico. La razón de validar paso a paso en lugar de todo de golpe es que un único toast con cinco errores es mucho menos amigable que un toast claro que dice "el email no tiene un formato válido".

### 4.7 Limpieza de las vistas heredadas del template

Las plantillas de login y registro originalmente venían del template Shofy en HTML estático y traían bastante "ruido": botones de login con Google/Facebook/Apple sin implementar, enlaces a archivos `register.html`, `login.html` y `forgot.html` que no existen en una SPA, y un botón de submit como `<a href="#" onclick="return false;">` en lugar de un `<button>` semánticamente correcto.

Decidí limpiar las dos vistas:

- **Comenté los botones de redes sociales** dentro de un bloque `<!-- ... -->`. No los borré para poder reactivarlos en el futuro si decidiera implementar OAuth, pero actualmente no se ven.
- **Sustituí los `href` estáticos por `[routerLink]`** de Angular. En lugar de `<a href="register.html">` ahora hay `<a [routerLink]="['/register']">`, lo cual permite navegación SPA sin recarga.
- **Cambié el botón de submit por un `<button (click)="login()">`**, mucho más correcto a nivel HTML semántico y de accesibilidad.

Para que los `[routerLink]` funcionen en componentes standalone hay que importar `RouterLink` y añadirlo al array `imports` del decorador `@Component`. Esto es algo nuevo de Angular 17: en versiones anteriores con `NgModule` venía heredado del módulo, pero en standalone cada componente tiene que declarar sus propias dependencias.

### 4.8 Integrar la plantilla Shofy en Angular

La tienda pública está construida sobre Shofy, una plantilla HTML/CSS/jQuery muy popular en el mercado de templates de ecommerce. Adaptarla a Angular fue un reto inesperado porque las plantillas estáticas asumen que cuando se carga la página, todo el DOM está ya montado. En una SPA Angular, el DOM se construye dinámicamente cuando arranca el bootstrap, por lo que los plugins jQuery del template no encuentran los elementos a los que tienen que acoplarse y terminan rotos.

La solución pasó por:

1. Cargar todos los scripts del template (jQuery, Slick, Swiper, Wow, Magnific Popup, etc.) directamente en el `index.html`, en el orden correcto: jQuery primero, después los plugins, y al final el `main.js` que llama a la función `HOMEINIT($)` que inicializa todo.
2. Declarar `$` y `HOMEINIT` como globales en TypeScript, para que el compilador no se queje:
   ```typescript
   declare var $:any;
   declare function HOMEINIT([]):any;
   ```
3. Llamar a `HOMEINIT($)` desde el constructor del `AppComponent`, dentro de un `setTimeout(...,50)` para asegurarme de que Angular ya ha pintado el DOM cuando los plugins intentan acoplarse.

El problema más raro que tuve fue el del **preloader infinito**. La plantilla muestra al cargar un círculo girando con el logo de Shofy, y la lógica para ocultarlo está en el `main.js`:

```javascript
$(window).on("load", function () {
    $("#loading").fadeOut(500);
});
```

Lo que pasa es que el evento `window.load` se dispara cuando el navegador termina de descargar todo el HTML, los scripts y las imágenes. Eso ocurre **antes** de que Angular arranque, así que cuando el `HOMEINIT` registra ese listener, el evento ya se ha disparado y nunca vuelve. Resultado: el preloader se quedaba para siempre y parecía que la página estaba colgada.

La solución fue forzar el `fadeOut` manualmente desde el `AppComponent`, justo después de inicializar los plugins:

```typescript
setTimeout(() => {
    HOMEINIT($)
    $("#loading").fadeOut(500)
}, 50)
```

Esto no toca la plantilla original (que mantengo intacta para poder actualizarla en el futuro si compro una nueva versión) y resuelve el problema sin efectos secundarios.

---

## 5. Errores que me bloquearon (y cómo los resolví)

He preferido recogerlos aquí en lugar de en cada apartado correspondiente porque algunos no son achacables a un módulo concreto y porque, sinceramente, son la parte de la que más he aprendido. Si alguien lee esto en el futuro, ojalá le ahorre algunas horas.

**El "error CORS" que no era CORS.** Cuando empecé a probar el login desde el frontend, el navegador me decía constantemente que la petición estaba bloqueada por CORS. Pasé un buen rato modificando configuración de Laravel buscando dónde estaba el problema, hasta que me fijé en que el código de estado HTTP era `null`. CORS real devuelve 204 o 403, nunca null. Lo que pasaba era que había parado el servidor Laravel al cerrar la terminal y no me había dado cuenta. Levantar `php artisan serve` lo solucionó al instante. Lección: leer SIEMPRE el código de estado antes de tocar configuración.

**`Auth::factory()` no existe.** Otro clásico. Mi `respondWithToken` llamaba a `Auth::factory()->getTTL()` y daba "method not exist". Era porque `Auth` por defecto devuelve el guard `web` (sesiones), que es un `SessionGuard` y no tiene ese método. Hay que llamar siempre a `Auth::guard('api')` para que devuelva el guard JWT. El IntelliSense de VSCode tampoco ayuda aquí porque el método `factory` solo existe en la clase concreta `JWTGuard`, no en la interfaz que ve el editor, así que sale subrayado en rojo aunque en runtime funciona perfectamente.

**ngx-toastr v20 incompatible.** Lo conté arriba. Instalar siempre la versión que se corresponde con la versión de Angular del proyecto, y nunca forzar con `--force`.

**`routes/api.php` no existe.** Me llevó como una hora entender que en Laravel 11+ ese archivo se ha eliminado del esqueleto por defecto. En todos los tutoriales antiguos asumen que existe.

**Hot reload de Angular y servicios singleton.** Cuando hacía cambios en el `AuthService` mientras estaba navegando por la app, a veces el comportamiento no cambiaba. Entendí que Angular conserva la instancia del servicio aunque el código se recompile, así que hay que forzar un refresco completo (Cmd+R) para que se cree una instancia nueva con el código modificado.

**SoftDeletes y la columna `deleted_at`.** Añadí el trait `SoftDeletes` al modelo `User` siguiendo la idea del tutorial, sin saber que también necesitaba una columna `deleted_at` (timestamp nullable) en la tabla. Lo añadí desde phpMyAdmin para no tener que hacer una migración entera por ese campo, y avancé.

---

## 6. Lo que dejo pendiente

Era inevitable que no me diera tiempo a implementarlo todo, y prefiero ser honesta con lo que está y lo que no:

- **Guards en Angular**: tengo el archivo `auth.guard.ts` generado pero vacío. La idea es proteger las rutas privadas (carrito, perfil, etc.) con un `CanActivate` que compruebe si hay token antes de dejar entrar. Sin esto, hay un breve "flash" de 50-500ms en el que se ve el contenido del login antes de redirigir al home, lo cual es feo pero funcional.
- **Interceptor HTTP**: lo correcto es tener un interceptor que añada automáticamente la cabecera `Authorization: Bearer <token>` a todas las peticiones que necesiten autenticación, en lugar de tener que ponerla a mano en cada llamada.
- **Server-Side Rendering (SSR)**: Angular 17 lo soporta de forma nativa, lo cual mejoraría el SEO y los tiempos de carga inicial. Estuve a punto de activarlo pero requería refactorizar partes del código que dependen de objetos del navegador (`window`, `localStorage`, jQuery), y dado el tiempo del que disponía preferí dejarlo para una iteración futura. Para un ecommerce real es muy recomendable porque permite que Google indexe correctamente el catálogo de productos.
- **CRUD completo de productos, categorías, pedidos**: implementado parcialmente. El módulo de auth se llevó más tiempo del previsto.
- **Tests automatizados**: no he escrito ninguno. Para producción habría tests unitarios con PHPUnit en el backend y con Karma/Jasmine en Angular, además de tests end-to-end con Cypress simulando el flujo registro → email → login.
- **Almacenamiento del token en cookie httpOnly**: usar `localStorage` es vulnerable a XSS. En producción se debería pasar a cookies httpOnly con flags Secure y SameSite=Strict.
- **Recuperación de contraseña**: no la prometí en la propuesta inicial, pero es una funcionalidad esperable en cualquier ecommerce. La estructura es muy parecida a la verificación de email (envío de correo con un código `uniqd` y endpoint que cambia el campo) y, de hecho, sería bastante rápido implementarla reutilizando lo ya hecho.
- **Migración del despliegue a Docker**: el despliegue actual se hace en un servidor de DigitalOcean configurado a mano con Nginx, PHP-FPM, MySQL y Node. Envolver esto en contenedores con `docker-compose` daría reproducibilidad total y simplificaría las puestas en marcha en otros entornos.

---

## 7. Reflexión final

He aprendido más debugging de Laravel y de Angular en los meses que he dedicado al TFG que en todos los cuatrimestres anteriores juntos. La diferencia es que aquí no tengo a un profesor que me diga "esto es así porque sí": cuando algo no funciona, tengo que abrir documentación, leer changelogs, buscar en Stack Overflow y, sobre todo, **diagnosticar antes de actuar**. Eso ha sido la mayor lección.

Otra cosa que destacaría es lo desactualizada que está la mayor parte del material formativo en internet. Los tutoriales de Laravel se quedaron en la versión 8 o 9 en muchos casos, y no avisan de los cambios introducidos en la 10 y la 11. Lo mismo con Angular: la mayoría de cursos siguen usando `NgModule` aunque desde la 17 lo recomendado es standalone. Mi ritmo se ralentizó muchas veces porque "lo del tutorial no me funcionaba", y descubrir el porqué (siempre era una API que se había deprecado) era la mitad del trabajo.

Si volviera a empezar el proyecto, intentaría tomarme con menos miedo el cambiar las cosas: durante las primeras semanas seguía los tutoriales casi al pie de la letra incluso cuando algo me chirriaba, por miedo a romper algo. Después fui aprendiendo que si una decisión técnica me parecía mejor, lo razonable era hacerla a mi manera y dejar constancia del porqué. De hecho, parte de los problemas más enrevesados que he tenido (como el `__construct` con middleware) se resolvieron entendiendo que el tutorial estaba escrito para una versión anterior y adaptándolo.

A nivel personal, me llevo la sensación de haber construido algo "de verdad" por primera vez, no un ejercicio de clase. Sé qué decisiones he tomado y por qué, sé dónde están los puntos débiles, y sé qué haría si tuviera más tiempo. Creo que eso es lo que realmente importa.
