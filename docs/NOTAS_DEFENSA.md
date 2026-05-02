# Notas para la defensa del TFG

Apuntes rápidos para tener controladas las preguntas que probablemente te haga el tribunal. Cada respuesta es la versión "que diría yo en la defensa" — corta, clara y justificada.

---

## Preguntas previsibles + respuestas

### 🔹 "¿Por qué una tienda de ropa de segunda mano y no un ecommerce genérico?"
Quería que el proyecto tuviera **identidad propia** y un nicho concreto, no una tienda genérica más. Elegí ropa de segunda mano para mujer por tres motivos:
1. **Mercado real y en crecimiento**: plataformas como Vinted o Wallapop demuestran que hay demanda y que tiene sentido como modelo de negocio.
2. **Vinculación con economía circular**: el consumo de moda sostenible es un valor que me parece importante y diferencia el proyecto frente a un Amazon más o un Aliexpress más.
3. **Conocimiento del dominio**: es un sector cercano a mi día a día, lo que me permitió tomar decisiones de diseño con criterio (qué categorías importan, qué filtros son útiles, qué información necesita ver una compradora) en lugar de inventarme un catálogo en abstracto.

El catálogo está estructurado en **2 departamentos** (Ropa y Accesorios), **11 categorías** y unas **10 subcategorías**, deliberadamente acotado: para un TFG prefería resolver bien lo esencial antes que abrir mil categorías que se quedaran vacías.

### 🔹 "¿Por qué has elegido Laravel 12 y Angular 17?"
Son las versiones **estables más recientes** en el momento de empezar el proyecto (Laravel 12 LTS y Angular 17 con standalone components). Quería usar tecnologías actuales para que el código no quede desfasado al entregar el TFG, y para aprender los patrones modernos (no los heredados).

### 🔹 "¿Por qué dividiste en tres proyectos en vez de uno solo?"
Para reflejar una **arquitectura headless real**: el backend (API) es independiente y no conoce a sus consumidores. El admin y la tienda son SPAs distintas con responsabilidades distintas (gestión vs venta). Esto:
- Permite desplegarlas **por separado** (escalado independiente).
- Facilita reutilizar el mismo API con futuras apps móviles.
- Sigue el patrón de muchos ecommerce reales (Shopify, BigCommerce, etc.).

### 🔹 "¿Por qué JWT y no sesiones de Laravel o Sanctum?"
- Las **sesiones** requieren cookies y mismo-dominio → no funcionan bien con Angular en otro puerto.
- **Sanctum** está pensado sobre todo para cookies de sesión + CSRF cuando el frontend está en el mismo dominio.
- **JWT** es el estándar para APIs **stateless** consumidas desde SPAs separadas: el token se envía en el header `Authorization: Bearer ...` y el servidor no necesita guardar nada de estado.
- Además, JWT escala mejor en arquitecturas con varios servidores (no necesitas pegamento tipo Redis para compartir sesiones).

### 🔹 "¿Cómo funciona JWT exactamente?"
1. El usuario manda email + password al endpoint `/login`.
2. El backend verifica las credenciales y, si son correctas, **firma un token** con `HS256` usando la clave secreta (`JWT_SECRET` del `.env`).
3. El token tiene 3 partes separadas por puntos: **header** (algoritmo), **payload** (datos del usuario y claims como `exp`, `iat`) y **firma** (HMAC del header+payload con la clave secreta).
4. El frontend lo guarda en `localStorage`.
5. En cada petición posterior, lo envía en el header `Authorization: Bearer <token>`.
6. El backend valida la firma (que no haya sido manipulado) y la fecha de expiración.

### 🔹 "¿Cómo gestionas los roles/perfiles de usuario?"
Mediante una columna `type_user` en la tabla `users`:
- `1` → administrador
- `2` → cliente

Los **endpoints de login son distintos** según el rol (`login` para admin, `login_ecommerce` para cliente) y filtran por `type_user` en el `attempt()` del guard JWT. Esto garantiza que un cliente no pueda colarse al panel de admin aunque tenga credenciales válidas.

### 🔹 "¿Cómo proteges los endpoints privados?"
Aplico el middleware `auth:api` desde las **rutas** (no desde el constructor del controlador, que ya no es válido en Laravel 11+). Las rutas se agrupan así:
```php
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', ...);
    Route::post('/me', ...);
    // etc.
});
```
Sin token válido en la cabecera, Laravel devuelve un `401 Unauthenticated`.

### 🔹 "¿Qué pasa si el token JWT caduca?"
- Por defecto el token vive **1 hora** (configurado en `config/jwt.php`).
- Para no obligar al usuario a re-logarse cada hora, hay un endpoint `/refresh` que intercambia un token a punto de caducar por otro nuevo.
- Si el token está caducado **y** no se refresca, las peticiones devuelven `401` y el frontend redirige al login.

### 🔹 "¿Cómo verificas el email del usuario?"
1. Al registrarse, el backend genera un código único (`uniqid()`) y lo guarda en la columna `uniqd` del usuario. El campo `email_verified_at` queda en `null`.
2. Se envía un email vía SMTP de Gmail (con App Password) que contiene un botón con un enlace `http://localhost:4200/login?code=<uniqd>`.
3. Cuando el usuario hace click, el frontend lee el `code` (con `ActivatedRoute.queryParams`) y llama al endpoint `POST /api/auth/verified_auth`, que actualiza `email_verified_at = now()` en el usuario cuyo `uniqd` coincida.
4. El método `login_ecommerce` rechaza con `403` cualquier intento de login si `email_verified_at` está null.

### 🔹 "¿Por qué no usas un único endpoint de login?"
Porque administradores y clientes entran por aplicaciones distintas (Metronic vs Shofy) y tienen reglas de acceso distintas. El `login` filtra por `type_user=1` (admin), `login_ecommerce` filtra por `type_user=2` (cliente) **y además** exige email verificado. Mantenerlos separados hace el código más claro y permite evolucionarlos por separado.

### 🔹 "¿Cómo validas las entradas del usuario?"
En los dos lados, frontend y backend, sin confiar nunca solo en uno:
- **Frontend** (Angular): valida en cascada antes de enviar la petición HTTP (campos vacíos → formato de email con regex → teléfono numérico de 9 dígitos → contraseña con mínimo 8 caracteres). Devuelve toasts específicos por cada error.
- **Backend** (Laravel): usa el `Validator::make` con reglas (`required`, `email`, `unique:users`, `digits:9`, `min:8`, etc.) y mensajes de error en español personalizados. Si la validación falla, devuelve un 400 con el detalle.

El frontend valida para **dar feedback inmediato** y evitar peticiones innecesarias. El backend valida porque es **la última línea de defensa**: cualquiera puede saltarse el JS y mandar peticiones con curl o Postman.

### 🔹 "¿Cómo manejas CORS?"
Laravel 12 trae el middleware `HandleCors` activo por defecto. Como el frontend (`localhost:4200`) y el backend (`127.0.0.1:8000`) viven en orígenes distintos, el middleware permite peticiones desde cualquier origen (configurable en `config/cors.php`). Cada petición POST genera un **preflight `OPTIONS`** automático que el backend responde con las cabeceras adecuadas.

### 🔹 "¿Qué seguridad tiene la contraseña?"
- Hashing con **bcrypt** (mediante `bcrypt(request()->password)`). Bcrypt es resistente a ataques de fuerza bruta porque es deliberadamente lento.
- Validación mínima: `min:8` caracteres en el registro.
- En la respuesta JSON nunca se incluye el campo `password` (configurado en `$hidden` del modelo `User`).

### 🔹 "¿Por qué Standalone Components?"
- Es el patrón **recomendado y por defecto** desde Angular 17.
- Cada componente declara explícitamente sus dependencias (`imports: [FormsModule, ...]`), lo que hace el código más **legible**.
- Permite mejor **tree-shaking** (no se cargan módulos enteros que no usas).
- Los `NgModule` quedan deprecated en proyectos nuevos.

### 🔹 "¿Por qué `localStorage` para guardar el token? ¿No es inseguro?"
- Para un proyecto académico es una solución razonable y muy común.
- **Riesgo conocido**: vulnerable a **XSS** (un script malicioso podría leer el token).
- Mitigación: en producción se usaría `httpOnly cookie` con flag `Secure` + `SameSite=Strict`, que el JavaScript no puede leer.
- En el TFG se prioriza la simplicidad y la separación frontend↔backend (las cookies traen complicaciones de CORS y cross-domain).

### 🔹 "¿Cómo es el flujo de comunicación frontend → backend?"
1. El usuario interactúa con el componente Angular.
2. El componente llama a un método del `AuthService` (o `ProductService`, etc.).
3. El servicio usa `HttpClient` para hacer la petición HTTP.
4. RxJS gestiona la respuesta como un **Observable**, que se transforma con `pipe(map(...))` y captura errores con `catchError`.
5. El componente se suscribe con `subscribe({ next, error })` y actualiza la vista o muestra un toast.

### 🔹 "¿Has implementado tests?"
*(Si la respuesta es "no", ser honesta y explicar qué tipo se haría)*
"No automatizados todavía. Para un proyecto en producción habría:
- **Tests unitarios** del backend con PHPUnit (validar que `register` crea el usuario correcto, que `login` rechaza credenciales malas, etc.).
- **Tests unitarios** de Angular con Jasmine/Karma para los servicios.
- **Tests end-to-end** con Cypress simulando el flujo registro → email → login completo."

### 🔹 "¿Qué mejorarías?"
- Implementar el **endpoint de verificación de email** completo (procesar el `code`).
- Añadir **interceptor HTTP** en Angular para inyectar el token automáticamente en cada petición.
- Añadir **guards `CanActivate`** para proteger rutas privadas a nivel de routing.
- Implementar **refresh token automático** justo antes de que el token actual caduque.
- Cubrir con **tests automatizados** los flujos críticos.
- Migrar la cookie de almacenamiento del token a `httpOnly` cuando se haga el deploy a producción.
- Añadir **rate limiting** en los endpoints de login y registro para evitar ataques de fuerza bruta.

### 🔹 "¿Por qué no usas Server-Side Rendering (SSR) si Angular 17 lo soporta?"
Lo evalué pero decidí dejarlo fuera por dos razones:
1. **Compatibilidad**: mi `AppComponent` usa jQuery (porque el template Shofy lo necesita) y `localStorage` se accede en el constructor del `AuthService`. Ambos son APIs del navegador que **no existen en el servidor Node** donde corre el SSR. Habría que envolver esos accesos en `afterNextRender()` (la API nueva de Angular 17 para diferir código al cliente), lo cual implica refactorizar varios archivos.
2. **Prioridad para el TFG**: el SSR es valioso sobre todo para **SEO** (que Google indexe mejor el catálogo). Para una entrega académica donde el tribunal va a probar el flujo manualmente, SEO no aporta. He preferido invertir el tiempo en funcionalidades visibles (productos, carrito) antes que en optimización de buscadores.

Lo dejo documentado en "Vías futuras" como mejora para una versión real en producción.

### 🔹 "¿Cómo despliegas el proyecto?"
En un **Droplet de DigitalOcean** (Ubuntu Server). El proceso es: configuración manual de Nginx con virtual hosts (`sites-available`), instalación de PHP 8.2-FPM, MySQL, Node.js, clonación del repositorio desde GitHub, build de los Angular en producción, y certificados SSL gratuitos con Let's Encrypt. El DNS apunta el dominio al droplet con registros A. **No uso XAMPP/MAMP** — todo está configurado a mano siguiendo buenas prácticas de servidor real.

Como entregable de "máquina virtual" del proyecto preparo una VM local en VirtualBox con Ubuntu Server, replicando la misma instalación y exportada como `.ova`. Así, el tribunal puede levantar el proyecto sin necesidad de conexión al droplet.

### 🔹 "¿Por qué dos templates externos (Metronic y Shofy)?"
- **Metronic** es uno de los templates de admin más extendidos y profesionales del mercado, pensado para Angular.
- **Shofy** es un template de ecommerce moderno, optimizado para SEO y conversión, pero originalmente HTML/jQuery.
- Usarlos permite centrar el TFG en **la lógica de negocio y la integración**, no en el diseño visual desde cero (que sería un TFG de UX, no de fullstack).
- Adaptar Shofy a Angular ha sido en sí mismo un reto técnico (preloader infinito, plugins jQuery dentro de SPA, etc.).

---

## Decisiones técnicas justificadas (cheat sheet)

| Decisión | ¿Por qué? |
|---|---|
| Laravel 12 | LTS reciente, comunidad enorme, ORM Eloquent muy productivo |
| Angular 17 standalone | Patrón actual, mejor DX, bundles más pequeños |
| MySQL | Compatibilidad universal, perfectamente soportado por Eloquent |
| JWT vs Sanctum | Stateless, multi-frontend, estándar para APIs SPA |
| `tymon/jwt-auth` | Es la implementación de JWT más usada y mantenida en Laravel |
| Bcrypt para passwords | Estándar de la industria, resistente a brute force |
| `email_verified_at` null por defecto | Patrón estándar de Laravel para verificación de email |
| `SoftDeletes` en `User` | Ecommerce necesita preservar histórico aunque "borre" usuarios |
| ngx-toastr | Notificaciones no-bloqueantes, librería más popular en Angular |
| Standalone components | Recomendación oficial de Angular 17+ |
| `provideHttpClient()` | Forma moderna de registrar servicios en standalone |
| Centralizar URLs en `config.ts` | Cambio de entorno (dev → prod) en un solo sitio |
| Gmail con App Password | Solución gratuita y suficiente para entorno de desarrollo |
| 2 endpoints de login (admin/cliente) | Filtrado por `type_user`, lógica desacoplada por rol |
| Validaciones en frontend Y backend | Frontend = UX inmediata; backend = última línea de defensa contra peticiones manuales |
| Mensajes de validación en español | Mejor experiencia para usuarios hispanohablantes; los defaults de Laravel están en inglés |
| Saltarse el SSR | Incompatible con jQuery + localStorage del template; SEO no es prioritario en TFG |
| Despliegue en DigitalOcean (no Docker) | Cumple normativa (no es localhost); Docker no se vio en clase, no es exigible |
| VirtualBox como entregable de "VM" | Permite al tribunal probar el proyecto sin acceso al droplet |

---

## Glosario rápido

| Término | Definición de bolsillo |
|---|---|
| **JWT** | JSON Web Token. Cadena firmada con 3 partes (header.payload.signature) que sustituye a las sesiones. |
| **CORS** | Cross-Origin Resource Sharing. Mecanismo del navegador que controla peticiones entre dominios distintos. |
| **SPA** | Single Page Application. App web que carga una sola vez y navega sin recargar (Angular, React, Vue). |
| **REST API** | Estilo de API que usa HTTP + JSON, con verbos GET/POST/PUT/DELETE para operaciones CRUD. |
| **Standalone Component** | Componente Angular sin `NgModule`, declara sus dependencias en su decorador. |
| **Middleware** | Capa que se ejecuta antes/después de un endpoint para hacer comprobaciones (auth, CORS, logging…). |
| **Bcrypt** | Algoritmo de hashing diseñado para ser lento y resistente a fuerza bruta. |
| **Soft Delete** | Borrado lógico: en vez de eliminar la fila, se marca con un timestamp en `deleted_at`. |
| **Eloquent** | ORM de Laravel — mapea tablas a clases PHP, evita escribir SQL manualmente. |
| **RxJS** | Librería de programación reactiva (Observables) usada por Angular para flujos asíncronos. |
| **Preflight** | Petición `OPTIONS` que el navegador envía automáticamente antes de un POST/PUT cross-origin. |
| **App Password** | Contraseña de un solo uso para apps externas en Gmail (requiere 2FA activada). |
| **Hot reload** | Recompilación incremental de Angular al detectar cambios en el código. |
| **Tree-shaking** | Eliminación de código muerto durante el build (reduce el bundle). |

---

## Atajos para la presentación oral

- Si te preguntan por algo que no sabes: "No lo he implementado todavía, pero la idea sería [explica brevemente]". **Es 100x mejor que decir "no sé"**.
- Si te bloqueas con una palabra técnica: usa el **glosario rápido** de arriba para tirarte un cable.
- Empieza por el **diagrama de arquitectura** (sección 3 de la memoria). Te orienta a ti y al tribunal.
- Termina con las **mejoras futuras**: muestra que tienes visión y sabes que el proyecto es un MVP.
