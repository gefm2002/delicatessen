# STRUCTURA
## Propuesta comercial — Delicatessen

**Empresa:** Structura  
**Web:** https://structura.com.ar  
**Responsable:** Gastón Fernández  
**Proyecto:** Tienda online para supermercado/almacén gourmet

---

## Objetivo

Desarrollar una tienda online profesional que permita:
- Generar pedidos directos y estructurados vía WhatsApp
- Presentar productos gourmet, promociones y boxes de forma clara y atractiva
- Administrar todo el contenido del sitio sin necesidad de conocimientos técnicos
- Gestionar órdenes de forma eficiente con seguimiento de estados

El foco del proyecto es vender, ordenar la oferta y simplificar la gestión diaria del negocio.

---

## Alcance del servicio

Diseño y desarrollo de una **Single Page Application (SPA)** utilizando React + TypeScript, optimizada para dispositivos móviles y desktop.

### Secciones incluidas

- **Hero principal** con imagen destacada y llamados a la acción
- **Categorías de productos** (Carnicería, Fiambres y Quesos, Boxes, Panadería, Bebidas, Almacén, etc.)
- **Carruseles de productos:**
  - Productos destacados
  - En promoción
  - Ofertas especiales
  - Productos nuevos
- **Catálogo completo** con filtros y buscador
- **Detalle de producto** con selección de cantidad/peso según tipo
- **Carrito de compras** con persistencia local
- **Checkout completo** con formulario de datos del cliente
- **Sección de Sucursales** con horarios, mapas y contacto
- **Promociones bancarias** (Macro, Mercado Pago, etc.)
- **Preguntas frecuentes (FAQs)**
- **Botón flotante de WhatsApp** para contacto directo
- **Footer** con información de contacto y redes sociales

---

## Funcionalidades principales

### Catálogo y productos

- **Catálogo completo** con filtros por categoría, tipo de producto, promociones y stock
- **Buscador** para encontrar productos rápidamente
- **Tipos de productos:**
  - **Estándar:** Productos con precio fijo y cantidad (yerba, fideos, bebidas, etc.)
  - **A granel:** Productos con precio por kg y selector de peso (fiambres, quesos, carnes)
  - **Combo:** Boxes y regalos con precio fijo
- **Selección rápida** de cantidad/peso directamente desde el catálogo
- **Precios promocionales** con descuento fijo o porcentual
- **Estados de productos:** Destacado, Promoción, Oferta, Sin stock
- **Hasta 3 imágenes** por producto con optimización automática (WebP)

### Carrito y checkout

- **Carrito de compras** con persistencia local
- **Checkout completo** con formulario que incluye:
  - Datos del cliente (nombre, apellido, email, teléfono)
  - Método de pago (efectivo, transferencia, Mercado Pago, tarjetas, billeteras QR)
  - Tipo de entrega (retiro en sucursal o envío)
  - Dirección y zona (si es envío)
  - Sucursal preferida (si es retiro) o de referencia (si es envío)
  - Notas opcionales
- **Generación automática de mensaje de WhatsApp** con el pedido completo estructurado
- **Apertura automática de WhatsApp** con el mensaje prearmado
- **Número de orden incremental** para seguimiento

### Panel de administración autogestionable

El sitio cuenta con un **panel de administración completo** que permite:

#### Gestión de productos
- Crear, editar y eliminar productos
- Asignar categorías y tipos (estándar, a granel, combo)
- Configurar precios base y precios promocionales (fijo o porcentaje)
- Cargar hasta 3 imágenes por producto con optimización automática
- Activar/desactivar productos
- Marcar como destacado, promoción u oferta
- Control de stock

#### Gestión de categorías
- Crear, editar y eliminar categorías
- Ordenar categorías por prioridad
- Activar/desactivar categorías

#### Gestión de promociones
- Crear promociones con título, subtítulo y condiciones
- Configurar fechas de inicio y fin
- Asociar imágenes
- Activar/desactivar promociones

#### Gestión de sucursales
- Crear y editar sucursales
- Configurar direcciones y datos de contacto
- Establecer horarios por día de la semana
- Integrar mapas de Google Maps
- Configurar teléfono y WhatsApp por sucursal

#### Gestión de órdenes (Sistema tipo "Fuego Amigo")
- **Listado de órdenes** con filtros por estado
- **Estados de orden:**
  - Nueva
  - Contactada
  - Confirmada
  - En preparación
  - Enviada
  - Completada
  - Cancelada
- **Detalle completo de cada orden:**
  - Datos del cliente
  - Items del pedido con cantidades/pesos
  - Totales y método de pago
  - Tipo de entrega y dirección
  - Historial de eventos
  - Notas internas
- **Cambio de estado** con registro automático de eventos
- **Agregar notas internas** con envío opcional por WhatsApp
- **Botón de WhatsApp** para contactar al cliente con el mensaje del pedido
- **Modal de confirmación** antes de enviar notas por WhatsApp

#### Configuración del sitio
- Configurar nombre de la marca y tagline
- Establecer número de WhatsApp principal
- Configurar métodos de pago disponibles
- Configurar opciones de entrega
- Personalizar textos y configuraciones

---

## Beneficios clave

✅ **Más pedidos reales** gracias a mensajes guiados por WhatsApp con toda la información del cliente y del pedido estructurada

✅ **Autonomía total** para gestionar productos, categorías, promociones, sucursales y órdenes sin conocimientos técnicos

✅ **Presencia profesional** alineada con la calidad del servicio gourmet

✅ **Carrito de compras funcional** que ordena pedidos y reduce errores

✅ **Gestión eficiente de órdenes** con seguimiento de estados y comunicación integrada

✅ **Sitio pensado para escalar** sin rehacer el sistema

✅ **Optimización de imágenes** automática para mejor rendimiento

✅ **Diseño responsive** que funciona perfectamente en móviles y desktop

---

## Hosting y dominio

- **Hosting gratuito** el primer año en Netlify, sujeto a no superar el límite de tráfico mensual
- En caso de excedente, se evaluará la mejor opción de hosting pago
- **La registración del dominio** será gestionada por Structura
- **Costo anual del dominio:** ARS 8.500 (a cargo del cliente)

---

## Compromiso del cliente

- Validar diseño y textos finales
- Confirmar productos, categorías y promociones a incluir
- Entregar material necesario (logo, imágenes de productos, información de sucursales)
- Revisar y aprobar las adaptaciones de contenido al sistema de administración
- Proporcionar número de WhatsApp para integración

---

## Inversión

### **USD 300** — pago único

**Incluye:**
- Desarrollo completo del sitio web
- Implementación del panel de administración completo
- Sistema de gestión de órdenes con estados y seguimiento
- Integración con WhatsApp para generación de mensajes
- Optimización de imágenes y rendimiento
- Publicación online
- Hosting gratuito el primer año
- Registro de dominio (costo anual a cargo del cliente)

**Cambios futuros o nuevos requerimientos se cotizan por separado.**

---

## Modalidad de pago

- **50%** al aprobar la propuesta (USD 150)
- **50%** al salir a producción (USD 150)

**Medios de pago:**
- Transferencia o depósito en USD
- Pago en pesos a valor dólar blue promedio (compra/venta)

---

## Stack técnico

- **Frontend:** Vite + React + TypeScript + TailwindCSS
- **Backend:** Supabase (PostgreSQL) + Netlify Functions
- **Hosting:** Netlify
- **Base de datos:** PostgreSQL (Supabase)
- **Autenticación:** JWT personalizado para panel admin

---

## Tiempo estimado de desarrollo

**4-6 semanas** desde la aprobación de la propuesta y entrega de materiales.

---

## Contacto

**Structura**  
Web: https://structura.com.ar  
Email: contacto@structura.com.ar  
Responsable: Gastón Fernández

---

*Esta propuesta es válida por 30 días desde su emisión.*
