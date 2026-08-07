# TripTogether Colombia 🇨🇴 (PWA)

Plataforma para planificar viajes grupales entre familia o amigos y salidas familiares: propuesta y votación de destino, itinerario colaborativo, gastos compartidos y checklist de viaje, todo adaptado al contexto colombiano.

## 🚀 Puesta en Marcha (Cómo correr el proyecto)

Sigue estos pasos para levantar el entorno de desarrollo local:

### 1. Requisitos Previos
- **Node.js** v18 o superior.
- **npm** (o yarn/pnpm).
- Una base de datos MySQL (este proyecto está preconfigurado para TiDB Serverless).

### 2. Instalación de Dependencias
Abre tu terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto si no existe y asegúrate de tener configurada tu cadena de conexión a la base de datos:
```env
DATABASE_URL="mysql://USUARIO:PASSWORD@HOST:PUERTO/DATABASE?sslaccept=strict"
```
*(Nota: Para conexiones TiDB Cloud, asegúrate de mantener el parámetro `?sslaccept=strict` al final).*

### 4. Base de Datos y Datos de Prueba (Seed)
Para sincronizar el esquema y cargar los datos de demostración con los "Parches" precargados:
```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

### 5. Iniciar el Servidor
```bash
# Modo de desarrollo normal
npm run dev

# Modo producción (Recomendado para probar al 100% las funciones PWA)
npm run build
npm start
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧪 Datos de Prueba (Seed Data)

El sistema de autenticación de la aplicación es rápido y sin fricción: **Solo necesitas un Apodo y el Código del Parche**. Al ejecutar el script de seed, se han creado 3 escenarios de prueba. 

Ve a la página principal, haz clic en **"Unirse al Parche"**, e ingresa cualquiera de los siguientes códigos junto con tu apodo:

### Demo 1: Modo Indeciso - Votación
- **Código de Invitación:** `PUENTE-2026`
- **Contexto:** "Paseo de Puente Festivo con la Familia". Aún están decidiendo a dónde ir.
- **Qué probar:** Entra e intenta proponer un nuevo destino o votar por los existentes (Eje Cafetero, Santa Marta, etc.).

### Demo 2: Modo Decidido - Plan Express
- **Código de Invitación:** `ASADO-OLLA`
- **Contexto:** "Asado y Paseo de Olla Dominical". Es un plan de un solo día.
- **Qué probar:** Ve al **Checklist** y ofrécete a llevar ("Yo lo llevo") el Bafle y Parqués. Luego revisa el **Cronograma** para ver las horas de las actividades.

### Demo 3: Modo Decidido - Viaje Confirmado (Deudas)
- **Código de Invitación:** `SAN-ANDRES-26`
- **Contexto:** "Vacaciones de Fin de Año en San Andrés".
- **Qué probar:** Ve a la sección de **Cuentas Claras (Gastos)**. Podrás ver que Juan pagó los tiquetes y Ana el hospedaje. Podrás ver las "Deudas Simplificadas" y el botón para "Marcar pagado".

### 👥 Apodos pre-cargados
Puedes usar cualquier apodo nuevo para unirte como un nuevo participante, pero si quieres entrar como alguien que ya tiene gastos o votos registrados en los demos, usa alguno de estos nombres exactos al unirte:
- `Juan`
- `Carlos`
- `Ana`
- `Tío Roberto`
- `Doña Marta`

*(El sistema identificará que ya existe un usuario con ese nombre y se vinculará).*
