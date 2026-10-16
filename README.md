# BioGestión

**BioGestión** es una aplicación móvil para el monitoreo y gestión en tiempo real de sistemas de aeración en explotaciones acuícolas. Permite visualizar la presión de los sopladores, configurar umbrales de alerta, gestionar tanques y lotes, y reaccionar a tiempo ante cualquier desviación crítica.

## Problema que resuelve

En granjas acuícolas, la aeración es uno de los puntos más críticos para la supervivencia del cultivo. Un fallo o una caída de presión puede provocar pérdidas económicas importantes si no se detecta a tiempo.

BioGestión centraliza el monitoreo de los dispositivos de aeración, mostrando datos en tiempo real desde cualquier dispositivo móvil y permitiendo configurar alertas para actuar de forma preventiva.

## Funcionalidades principales

- **Monitoreo en tiempo real** – Visualización de PSI por soplador con actualización en tiempo real mediante WebSocket.
- **Gestión de umbrales** – Configuración de umbrales de presión por dispositivo para detectar caídas o subidas anómalas.
- **Gestión de dispositivos de aeración (Blowers)** – Alta, configuración, edición y eliminación de dispositivos desde la app.
- **Gestión de tanques y lotes** – Organización de tanques, asignación de lotes y seguimiento por explotación.
- **Escaneo QR** – Identificación rápida de tanques o dispositivos mediante la cámara del móvil.
- **Mapa interactivo** – Ubicación georreferenciada de tanques con vista de mapa.
- **Autenticación segura** – Inicio de sesión con token JWT almacenado de forma segura con `expo-secure-store`.
- **Notificaciones push** – Alertas configurables ante eventos relacionados con presión.
- **Soporte multicanal** – Funciona en Android, iOS y Web gracias a Expo.
- **Modo claro/oscuro** – Adaptado a preferencias del usuario.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **[Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)** | Base del proyecto universal (móvil + web) |
| **[React Native 0.86.3](https://reactnative.dev/)** | Framework UI nativo |
| **[TypeScript 6.0.3](https://www.typescriptlang.org/)** | Tipado estático y mayor mantenibilidad |
| **[Expo Router](https://docs.expo.dev/router/introduction/)** | Navegación basada en archivos (file-based routing) |
| **[NativeWind 4 + Tailwind CSS 3](https://www.nativewind.dev/)** | Estilos consistentes con utilidades Tailwind |
| **[Axios](https://axios-http.com/)** | Cliente HTTP para comunicación con API REST |
| **[WebSocket / Context API](https://react.dev/learn/passing-data-deeply-with-context)** | Actualización en tiempo real de lecturas de sensores |
| **[expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)** | Almacenamiento seguro de credenciales/token |
| **[expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)** | Sistema de notificaciones push |
| **[expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/)** | Escaneo de códigos QR |
| **[Victory Native](https://commerce.nearform.com/open-source/victory-native)** | Gráficas para visualización de datos |
| **[Expo Updates](https://docs.expo.dev/versions/latest/sdk/updates/)** | Despliegue Over-The-Air (OTA) |

## Arquitectura

El proyecto sigue un enfoque **feature-first** combinado con una capa `core` reutilizable:

```text
src/
├── app/              # Rutas con Expo Router (auth, tabs, tanques...)
├── core/             # Componentes, tema, utils, hooks, configuración API
├── features/         # Dominios funcionales
│   ├── aeration/     # Lógica de sopladores, WebSocket, servicios y tipos
│   ├── auth/         # Autenticación, contexto y guardado seguro
│   └── tanks/        # Gestión de tanques, lotes y mapa
```

- **Separación por dominio**: Cada feature encapsula sus propios componentes, hooks, servicios, tipos y contexto.
- **UI reutilizable**: Componentes compartidos en `core/components` con diseño consistente.
- **Estado global claro**: Uso de React Context para sesión, tema y conexión WebSocket.
- **Tipado estricto**: Todo con TypeScript para reducir errores y facilitar escalado.

## Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/Ilde-R/farm-frontend.git
cd farm-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la URL de tu backend:

```env
EXPO_PUBLIC_API_URL=https://tu-backend-url.com/api
EXPO_PUBLIC_SOCKET_URL=https://tu-backend-url.com
```

> *El backend de este proyecto está disponible en [github.com/Ilde-R/farm-backend](https://github.com/Ilde-R/farm-backend/tree/develop).*

### 4. Ejecutar en modo desarrollo

```bash
npx expo start
```

Desde la terminal podrás abrir la app en:

- **Android Emulator** (`a`)
- **iOS Simulator** (`i`) – solo macOS
- **Expo Go** (app móvil)
- **Navegador web** (`w`)

También puedes usar los scripts definidos en `package.json`:

```bash
npm run android
npm run ios
npm run web
```

## Decisiones técnicas destacadas

- **Tiempo real sin sobrecarga**: Integración directa con WebSocket para mantener lecturas sincronizadas entre dispositivos sin polling innecesario.
- **UX orientada a campo**: Interfaz clara, minimalista y pensada para consultarse rápido con una mano.
- **Seguridad primero**: Uso de `expo-secure-store` para evitar exponer el JWT en almacenamiento no cifrado.
- **Mantenible a futuro**: Estructura feature-first que facilita añadir nuevos módulos (reportes, históricos, roles, etc.).
- **Listo para producción**: Configurado con `expo-updates` para actualizaciones OTA y build con EAS Build.

## Sobre mí

Soy **Ilde Noel Rios Ordaz**, desarrollador especializado en **React Native + Expo** con enfoque en apps móviles productivas, escalables y orientadas a resolver problemas reales del negocio.

Busco unirme a equipos donde pueda aportar valor construyendo productos sólidos con impacto directo.

- **GitHub:** [github.com/Ilde-R](https://github.com/Ilde-R)
- **LinkedIn:** [linkedin.com/in/ilde-noel-rios-ordaz-b757123b8](https://www.linkedin.com/in/ilde-noel-rios-ordaz-b757123b8/)
- **Correo:** ilderios0304@gmail.com

## 📄 Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).
