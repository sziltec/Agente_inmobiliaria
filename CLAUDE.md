# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

CRM inmobiliario con un agente IA que atiende leads por WhatsApp, Messenger e Instagram,
los cualifica y los vuelca en un dashboard donde los asesores humanos toman el control.
Next.js 16 + React 19, Prisma sobre Postgres (Supabase), Supabase Auth.
El código y los comentarios están en español: mantené ese idioma al escribir código nuevo.

## Comandos

```bash
npm run dev              # servidor de desarrollo
npm run build            # prisma generate && next build
npm run lint             # eslint
npm run seed:admin       # crea el primer admin (usa SEED_ADMIN_* del .env)
npm run agent:test       # chat con el agente por terminal, sin webhooks ni DB

npx tsx --test tests/*.test.ts                          # toda la suite (16 tests)
npx tsx --test tests/password-reset.test.ts             # un archivo
npx tsx --test --test-name-pattern "rejects malformed"  # un test puntual
```

No hay script `test` en [package.json](package.json): los tests se corren con `tsx --test`.
Son de `node:test`, sin base de datos ni red — inyectan dependencias falsas (ver más abajo).

## Migraciones: NO uses `prisma migrate dev`

El comentario en la cabecera de [prisma/schema.prisma](prisma/schema.prisma#L3) dice que corras
`prisma migrate dev`. **Está desactualizado — no lo hagas.** La base de Supabase tiene drift
respecto al historial de migraciones, y `migrate dev` intenta resetearla (borra datos reales).

El flujo correcto:

1. Editá `schema.prisma`.
2. Escribí el SQL a mano en `prisma/migrations/<timestamp>_<nombre>/migration.sql`.
3. `npx prisma migrate deploy` y `npx prisma generate`.

`DATABASE_URL` es el pooler (lo usa la app); `DIRECT_URL` es la conexión directa (la usa Prisma
para migrar). Ambas son necesarias.

## Arquitectura

### Un solo pipeline para los tres canales

Los tres webhooks ([app/api/webhooks/](app/api/webhooks/)) son wrappers de tres líneas sobre
`createMetaWebhook()` en [lib/channels/webhook.ts](lib/channels/webhook.ts), que resuelve el
handshake GET, verifica la firma HMAC de Meta ([lib/security.ts](lib/security.ts)) y delega en
`handleInboundMessage()` de [lib/conversation.ts](lib/conversation.ts) — el orquestador único:
upsert del lead → foto de perfil → conversación → dedupe por `providerMessageId` → guardar
entrante → LLM → guardar respuesta → actualizar lead → eventos → responder por el adaptador
del canal. **Toda lógica de negocio del bot vive ahí, no en las rutas.**

Lo específico de cada red (parsear el payload, enviar, `fetchProfile`) está en los adaptadores de
[lib/channels/](lib/channels/), detrás de `getAdapter(channel)`. Un canal nuevo se agrega ahí, sin
tocar el orquestador.

El webhook siempre responde 200 aunque el procesamiento falle, para que Meta no reintente en bucle.

### Tres compuertas que frenan la respuesta automática

En orden dentro de `handleInboundMessage`, con semántica distinta cada una:

1. **Canal apagado** (`Settings.whatsappEnabled` y compañía) → el mensaje se descarta entero, ni se registra.
2. **`Conversation.botEnabled = false`** → se registra el mensaje, no se responde (un humano tomó el chat).
3. **`Settings.runtime = HERMES`** → se registra el mensaje, no se responde: contesta Hermes.

### Doble runtime: Gemini vs Hermes

`Settings.runtime` (fila única `id = "global"`, ver [lib/settings.ts](lib/settings.ts), editable desde
`/configuracion`) decide quién contesta:

- **`GEMINI`** — esta app responde. [lib/agent/agent.ts](lib/agent/agent.ts) llama al LLM vía cliente
  OpenAI apuntado a Gemini ([lib/llm.ts](lib/llm.ts)), con una tool `updateLead` que extrae los datos
  de cualificación. El bucle de tools tiene tope `MAX_TOOL_ROUNDS = 5` porque Gemini a veces encadena
  tool calls sin cerrar nunca, y el timeout de Vercel se comía la respuesta entera. Gemini además
  puede mandar texto **junto** a los `tool_calls`, por eso se guarda `lastContent`.
- **`HERMES`** — un bot externo contesta y escribe de vuelta por la API interna
  ([app/api/internal/hermes/](app/api/internal/hermes/)), autenticada con bearer `HERMES_CRM_API_TOKEN`.
  El `GET /api/internal/hermes/messages` es la *compuerta final de entrega*: Hermes la consulta para
  saber si el bot sigue activo antes de mandar, y falla cerrado si no encuentra la conversación.

Ojo: `.env.example` lista `AGENT_RUNTIME`, `HERMES_API_BASE_URL`, `HERMES_MODEL`,
`HERMES_FALLBACK_TO_LLM` y `HERMES_TIMEOUT_MS`, pero **ningún código las lee**. Son de un diseño
anterior. La única variable de Hermes viva es `HERMES_CRM_API_TOKEN`.

### Handlers como factories (el patrón que hace testeable la API interna)

Las rutas de `/api/internal/hermes/` no tienen lógica: son `export const POST = createXHandler(fn, token)`.
La validación (Zod), la autenticación por bearer, las reglas de asignación de asesor y los errores
tipados viven en [lib/internal/hermes-lead.ts](lib/internal/hermes-lead.ts) y
[hermes-message.ts](lib/internal/hermes-message.ts); la persistencia se inyecta desde `save-hermes-*.ts`.
Los tests pasan un `save` falso y ejercitan el handler completo sin base de datos.
**Al agregar endpoints internos, seguí esta separación** — si no, el endpoint queda sin tests.

### Auth y dashboard

Supabase Auth es la fuente de verdad de credenciales; `Profile` es una tabla espejo cuyo `id` **es**
el UUID de Supabase (no se genera). El rol (`ADMIN`/`AGENT`) vive solo en `Profile`.

[proxy.ts](proxy.ts) en la raíz protege las rutas — en esta versión de Next se llama *Proxy* y exporta
`proxy()`, no `middleware()`. Usa `getUser()` (revalida contra el servidor), nunca `getSession()`.
Su `matcher` **excluye `/api`** a propósito: Meta llama los webhooks sin cookie de sesión, y si el
proxy los interceptara se cae todo el pipeline del bot.

En páginas y server actions, la verificación de sesión va por [lib/dal.ts](lib/dal.ts)
(`verifySession` / `getCurrentUser`, memoizados con `cache()` de React), no llamando a Supabase directo.

Las mutaciones son server actions en `app/(dashboard)/*/actions.ts`, una por sección. Las lecturas
son módulos por dominio en `lib/` (`leads.ts`, `properties.ts`, `messages.ts`, `stats.ts`,
`stats-agency.ts`). Los componentes de `components/` son casi todos client components que reciben
datos ya cargados por el server component de la página.

### Estadísticas

El dashboard de `/estadisticas` no recalcula sobre `Message`/`Lead`: lee la tabla `Event`, que
`handleInboundMessage` alimenta con `chat_opened`, `message_received` y `lead_qualified`.
Si agregás una métrica, lo más probable es que necesites emitir un evento nuevo ahí.
