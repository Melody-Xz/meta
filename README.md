## <div align='center'>🎀 @melody-xz/meta - API de WhatsApp Web 🍓</div>

<div align="center"><img src="https://speed3xz.bot.nu/storage/img/my-melody-hello-kitty-sanrio-clip-art-others-6a64d3cc3b5135d27cf3a7d43a373e14.png" alt="My Melody" width="300" style="border-radius: 20px;"/>
<!-- GitHub Stats --><p>
  <img src="https://github-readme-stats.vercel.app/api?username=melody-xz&show_icons=true&theme=radical&title_color=ff69b4&icon_color=ffb6c1&text_color=ffffff&bg_color=000000" alt="Estadísticas GitHub"/>
  
## 🌸 Nota Importante

Esta librería está basada en Baileys y ha sido personalizada con mucho amor 💖 por Melody. No está afiliada con WhatsApp.

## ✨ Aviso de Responsabilidad

@melody-xz/meta y su desarrolladora no pueden ser responsables por mal uso. Por favor, usa esta librería para crear cosas lindas y positivas, no para spam o actividades maliciosas.

## 🎀 Instalación

```bash
# Versión estable
npm install @melody-xz/meta
# o
yarn add @melody-xz/meta

# Versión de desarrollo
npm install github:melody-xz/meta
# o
yarn add github:melody-xz/meta
```

## 🌸 Ejemplo Rápido en JavaScript

```javascript
const { makeWASocket, useMultiFileAuthState } = require('@melody-xz/meta')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session-mymelody')
    
    const melody = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    melody.ev.on('connection.update', ({ connection }) => {
        if(connection === 'open') {
            console.log('🎀 ¡Conectado con éxito!')
        }
    })

    melody.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if(m.message) {
            await melody.sendMessage(m.key.remoteJid, { 
                text: '🍓 ¡Hola! Soy un bot de My Melody!' 
            })
        }
    })

    melody.ev.on('creds.update', saveCreds)
}

startBot()
```

## 🌸 Ejemplo Rápido en TypeScript

```typescript
import makeWASocket, { useMultiFileAuthState } from '@melody-xz/meta'

async function startBot(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState('session-mymelody')
    
    const melody = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    melody.ev.on('connection.update', ({ connection }) => {
        if(connection === 'open') {
            console.log('🎀 ¡Conectado con éxito!')
        }
    })

    melody.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if(m.message) {
            await melody.sendMessage(m.key.remoteJid!, { 
                text: '🍓 ¡Hola! Soy un bot de My Melody!' 
            })
        }
    })

    melody.ev.on('creds.update', saveCreds)
}

startBot()
```

## 🍓 Características Principales

· 🤖 Bots automáticos con respuestas inteligentes

· 🎨 Mensajes multimedia

· 💬 Comandos personalizados fáciles de implementar

· 📱 Soporte para grupos y chats privados

## 🎨 Mensajes Especiales

· 🍓 Stickers y GIFs de My Melody

· 🌸 Plantillas bonitas para respuestas

· 💖 Reacciones kawaii con emojis especiales

· ✨ Mensajes interactivos con botone

## 🔧 Funciones Técnicas

· 🚀 Conexión estable con reconexión automática

· 💾 Sesiones persistentes que se guardan solitas

· 📊 Manejo de errores con mensajes bonitos

· 🔄 Sincronización en tiempo real

## 💖 Características Técnicas

· 🎀 Sin Selenium - Conexión directa vía WebSocket

· 💖 Super eficiente - Ahorra mucha RAM

· 🌸 Soporte multi-dispositivo - Compatible con la versión web

· 🍓 Totalmente tipado - Con TypeScript y JavaScript

· 📱 API completa - Todas las funciones de WhatsApp Web

· 🚀 Rendimiento optimizado - Código eficiente y rápido

## 🎀 Uso Básico

Inicializar el Bot (JavaScript)

```javascript
const { makeWASocket, useMultiFileAuthState } = require('@melody-xz/meta')

const { state, saveCreds } = await useMultiFileAuthState('session-mymelody')
const melody = makeWASocket({
    auth: state,
    printQRInTerminal: true
})

melody.ev.on('creds.update', saveCreds)
```

Inicializar el Bot (TypeScript)

```typescript
import makeWASocket, { useMultiFileAuthState } from '@melody-xz/meta'

const { state, saveCreds } = await useMultiFileAuthState('session-mymelody')
const melody = makeWASocket({
    auth: state,
    printQRInTerminal: true
})

melody.ev.on('creds.update', saveCreds)
```

Enviar Mensajes

```javascript
// Mensaje de texto
await melody.sendMessage(jid, { text: '🌸 ¡Hola mundo!' })

// Imagen con caption
await melody.sendMessage(jid, {
    image: { url: './images/mymelody.jpg' },
    caption: '🍓 ¡Mira mi nueva foto!'
})

// Sticker
await melody.sendMessage(jid, {
    sticker: { url: './stickers/melody.webp' }
})
```

## 🌸 Comandos Personalizados

JavaScript

```javascript
melody.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text
    
    if(text === '!hola') {
        await melody.sendMessage(m.key.remoteJid, {
            text: '🎀 ¡Hola! Soy My Melody, ¿en qué puedo ayudarte?'
        })
    }
    
    if(text === '!stickers') {
        await melody.sendMessage(m.key.remoteJid, {
            text: '🍓 Aquí tienes stickers lindos!'
        })
    }
})
```

TypeScript

```typescript
melody.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text
    
    if(text === '!hola') {
        await melody.sendMessage(m.key.remoteJid!, {
            text: '🎀 ¡Hola! Soy My Melody, ¿en qué puedo ayudarte?'
        })
    }
})
```

## 🍓 Configuración Avanzada

JavaScript

```javascript
const melody = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    markOnlineOnConnect: false,
    browser: ["MyMelody Bot", "Chrome", "1.0.0"],
    logger: require('pino')({ level: 'silent' })
})
```

TypeScript

```typescript
import pino from 'pino'

const melody = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    markOnlineOnConnect: false,
    browser: ["MyMelody Bot", "Chrome", "1.0.0"],
    logger: pino({ level: 'silent' })
})
```

## ✨ Ejemplos de Funciones

Enviar Mensaje a Múltiples Chats

```javascript
async function broadcastMessage(jids, message) {
    for(const jid of jids) {
        await melody.sendMessage(jid, { text: message })
    }
}
```

Descargar Medios

```javascript
const { downloadMediaMessage } = require('@melody-xz/meta')

const stream = await downloadMediaMessage(message, 'buffer')
// Guardar o procesar el medio
```

## 🎀 Tipos para TypeScript

```typescript
import { WAMessage, WASocket } from '@melody-xz/meta'

interface MyBot extends WASocket {
    // Tus tipos personalizados aquí
}

function handleMessage(message: WAMessage): void {
    // Tu lógica de manejo de mensajes
}
```

---

## <div align="center">✨ Powered by Melody 🎀

</div>