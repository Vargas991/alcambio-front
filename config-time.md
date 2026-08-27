# Tarea: migrar selectivamente mejoras de `sistema-gestion-porcentaje` hacia `main`

Estoy trabajando LOCALMENTE sobre la rama `main`.

Existe otra rama del proyecto llamada `sistema-gestion` que contiene varias mejoras posteriores.

NO quiero hacer merge completo ni cherry-pick indiscriminado.

Necesito revisar esa rama y trasladar únicamente estas funcionalidades a `main`:

1. Configuración global de zona horaria.
2. Configuración de organización necesaria para obtener nombre/logo/timezone.
3. Uso consistente de zona horaria en backend y frontend.
4. Imagen/logo de organización en el header del PDF de estado de cuenta del cliente.

El logo del PDF ya está parcialmente adelantado en `main`, por lo que primero se debe revisar el código existente y completar/adaptar lo necesario, NO reemplazar indiscriminadamente todo el servicio PDF con la versión de la otra rama.

---

# REGLA PRINCIPAL

La rama `main` tiene lógica de negocio diferente y más antigua.

NO migrar desde `sistema-gestion`:

- soporte multimoneda nuevo
- balancesFiltrados
- balancesGlobales
- metodo PORCENTAJE
- montoResultado
- montoComision
- monedaDeuda
- nuevas reglas de Entrada/Salida
- cambios contables
- migraciones relacionadas con multimoneda
- cambios de Prisma que no sean estrictamente necesarios para configuración de organización/timezone
- cambios de ledger que alteren el esquema actual de `main`

La estructura actual de `main` debe seguir siendo compatible con:

```ts
resumen: {
  totalDebitosCop: number;
  totalCreditosCop: number;
  saldoFiltradoCop: number;
  estado: string;

  totalDebitosGlobalCop?: number;
  totalCreditosGlobalCop?: number;
  saldoTotalCop?: number;
  estadoTotal?: string;

  totalUtilidadRealCop?: number;
  utilidadPorDia?: {
    fecha: string;
    utilidadCop: number;
  }[];
}