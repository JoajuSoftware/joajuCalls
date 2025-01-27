# JoajuCalls

# Central Telefónica en la Nube - Dashboard

Este proyecto consiste en un **Dashboard para la gestión de una central telefónica desde la nube**, diseñado para facilitar la administración, el seguimiento y la gestión de agentes y reportes. Proporciona una interfaz moderna y eficiente, construida con tecnologías de vanguardia.

## 🚀 Características Principales

- **Perfiles de Usuario:**
  - **Administrador:** Gestión de usuarios, roles, configuraciones globales y supervisión en tiempo real.
  - **Agente:** Acceso a herramientas específicas para gestionar llamadas y métricas personales.
- **Reportes:** Análisis detallado de datos, métricas de rendimiento y exportación de reportes.

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - [Angular](https://angular.io/): Framework para aplicaciones web robustas y escalables. Versión 19
  - [Tailwind CSS](https://tailwindcss.com/): Framework CSS para un diseño rápido y altamente personalizable. Versión 3.4
  - [PrimeNG](https://primeng.org/): Conjunto de componentes UI para Angular. Versión 19
- **Arquitectura:** Basada en principios de **Screaming Architecture** para maximizar claridad y mantenibilidad del código.

## 📁 Estructura del Proyecto

```plaintext
src/
├── app/
│   ├── admin/        # Lógica principal del componente, servicios,componentes, etc.
│   ├── call-center/  # Lógica del componente, servicios, gestión de llamadas.
│   ├── reports/      # Reportes generados por las llamadas.
│   ├── shared/       # Componentes y utilidades compartidas
│   ├── assets/       # Recursos estáticos
│   └── environments/ # Configuraciones por entorno
