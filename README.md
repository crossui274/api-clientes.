# API REST de Clientes (Express + MySQL)

Actividad sumativa Semana 9 – Taller de Plataformas Web.
API REST con operaciones CRUD sobre la entidad `cliente`, consultas parametrizadas
(prevención de inyección SQL), validaciones y manejo de errores HTTP.

## Requisitos
- Node.js 18 o superior
- MySQL 8 (o MariaDB)
- Postman 
## Instalación y ejecución
1. Clonar el repositorio e instalar dependencias:
   ```bash
   npm install
   ```
2. Crear la base de datos y la tabla ejecutando el script SQL:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Copiar `.env.example` como `.env` y completar tus credenciales de MySQL.
4. Iniciar el servidor:
   ```bash
   npm start
   ```
   La API queda disponible en `http://localhost:3000`.

## Modelo de datos: `cliente`
| Campo | Tipo | Restricciones |
|---|---|---|
| id_cliente | INT | PK, autoincremental |
| nombre | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| telefono | VARCHAR(20) | opcional |
| created_at | DATETIME | por defecto fecha/hora actual |

## Endpoints
| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| POST | /clientes | Crear cliente | 201, 400, 409 |
| GET | /clientes | Listar clientes | 200 |
| GET | /clientes/:id | Obtener un cliente | 200, 400, 404 |
| PUT | /clientes/:id | Actualizar un cliente | 200, 400, 404, 409 |
| DELETE | /clientes/:id | Eliminar un cliente | 200, 400, 404 |

Ejemplo de body (POST / PUT):
```json
{ "nombre": "Ana Pérez", "email": "ana@correo.cl", "telefono": "+56912345678" }
```

## Seguridad aplicada
- Consultas preparadas con `pool.execute()` y parámetros `?` (nunca se concatena input al SQL).
- Validación de `id` (entero positivo), `nombre`, `email` y `telefono`.
- Restricción `UNIQUE` en `email` -> respuesta `409 Conflict`.
- Los errores internos no exponen detalles técnicos al cliente.
- Credenciales en variables de entorno (`.env` excluido del repositorio).

## Pruebas con Postman
Importar `postman/API_Clientes.postman_collection.json`. Ejecutar las peticiones en orden
(o con el Collection Runner); incluye pruebas automáticas y casos de error (400, 404, 409,
intento de inyección SQL).
