# 📄 Guía para Publicar la Política de Privacidad

## ✅ Archivo Creado

He creado el archivo `politica-privacidad.html` con una política de privacidad completa y profesional para tu app **Impostor Fútbol**.

## 📝 Antes de Publicar

### 1. Personalizar Información de Contacto

Abre `politica-privacidad.html` y busca la sección **"11. Contacto"**. Reemplaza:

- `[TU_EMAIL_AQUI]` → Tu email de contacto (ej: `contacto@tudominio.com` o `impostorfutbol@gmail.com`)
- `[TU_REPOSITORIO_AQUI]` → URL de tu repositorio GitHub (ej: `https://github.com/tu-usuario/impostor-futbol`)

### 2. Revisar el Contenido

Lee la política completa y asegúrate de que:
- ✅ Refleja correctamente cómo funciona tu app
- ✅ Menciona todos los datos que recopilas
- ✅ Está en español (o el idioma que prefieras)
- ✅ La fecha de actualización es correcta

---

## 🌐 Opción 1: Publicar en GitHub Pages (RECOMENDADO - Gratis)

### Paso 1: Crear Repositorio

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en **"New repository"** (botón verde)
3. Configura:
   - **Repository name**: `politica-privacidad-impostor-futbol` (o el nombre que prefieras)
   - **Visibility**: **Public** (necesario para GitHub Pages)
   - ✅ Marca **"Add a README file"**
4. Haz clic en **"Create repository"**

### Paso 2: Subir el Archivo HTML

**Opción A: Desde GitHub Web (Más fácil)**

1. En tu repositorio, haz clic en **"Add file"** → **"Upload files"**
2. Arrastra el archivo `politica-privacidad.html` a la ventana
3. Haz clic en **"Commit changes"** (botón verde abajo)

**Opción B: Desde Git (Si tienes Git instalado)**

```bash
# En la terminal, desde la carpeta del proyecto
cd C:\Users\PC\Desktop\ImpostorFutbol

# Inicializar git (si no está inicializado)
git init

# Agregar el archivo
git add politica-privacidad.html

# Commit
git commit -m "Agregar política de privacidad"

# Agregar el repositorio remoto (reemplaza TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/politica-privacidad-impostor-futbol.git

# Subir
git branch -M main
git push -u origin main
```

### Paso 3: Habilitar GitHub Pages

1. En tu repositorio de GitHub, ve a **Settings** (Configuración)
2. En el menú lateral izquierdo, busca **"Pages"**
3. En **"Source"**, selecciona **"Deploy from a branch"**
4. En **"Branch"**, selecciona:
   - Branch: `main` (o `master`)
   - Folder: `/ (root)`
5. Haz clic en **"Save"**

### Paso 4: Obtener la URL

Después de unos minutos, GitHub Pages estará activo. Tu URL será:

```
https://TU_USUARIO.github.io/politica-privacidad-impostor-futbol/politica-privacidad.html
```

**Nota**: Si renombras el archivo a `index.html`, la URL será más corta:
```
https://TU_USUARIO.github.io/politica-privacidad-impostor-futbol/
```

### Paso 5: Renombrar a index.html (Opcional pero Recomendado)

1. En GitHub, ve a tu archivo `politica-privacidad.html`
2. Haz clic en el ícono de lápiz (✏️) para editar
3. Copia todo el contenido
4. Haz clic en **"Add file"** → **"Create new file"**
5. Nombre: `index.html`
6. Pega el contenido
7. Haz clic en **"Commit new file"**
8. Elimina el archivo `politica-privacidad.html` (ve al archivo → Settings → Delete)

Ahora tu URL será más corta: `https://TU_USUARIO.github.io/politica-privacidad-impostor-futbol/`

---

## 🌐 Opción 2: Usar el Repositorio Principal del Proyecto

Si ya tienes un repositorio para el proyecto, puedes agregar la política ahí:

### Paso 1: Subir el Archivo

1. Ve a tu repositorio del proyecto en GitHub
2. Haz clic en **"Add file"** → **"Upload files"**
3. Sube `politica-privacidad.html`
4. Haz clic en **"Commit changes"**

### Paso 2: Habilitar GitHub Pages

1. Ve a **Settings** → **Pages**
2. Source: **"Deploy from a branch"**
3. Branch: `main` (o `master`), Folder: `/ (root)`
4. **Save**

### Paso 3: URL

Tu URL será:
```
https://TU_USUARIO.github.io/TU_REPOSITORIO/politica-privacidad.html
```

O si renombras a `index.html` y lo pones en una carpeta `docs/`:
```
https://TU_USUARIO.github.io/TU_REPOSITORIO/docs/
```

---

## 🌐 Opción 3: Otros Servicios de Hosting Gratuito

### Netlify (Gratis)

1. Ve a [netlify.com](https://www.netlify.com)
2. Crea una cuenta (gratis)
3. Arrastra la carpeta con `politica-privacidad.html` a Netlify
4. Obtendrás una URL como: `https://random-name-123.netlify.app`

### Vercel (Gratis)

1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta
3. Importa tu repositorio o sube el archivo
4. Obtendrás una URL automática

### Firebase Hosting (Gratis)

1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicializa: `firebase init hosting`
3. Sube: `firebase deploy`
4. URL: `https://tu-proyecto.web.app`

---

## ✅ Verificar que Funciona

1. Abre la URL en tu navegador
2. Verifica que la política se ve correctamente
3. Asegúrate de que todos los estilos se cargan bien
4. Verifica que los enlaces funcionan

---

## 📋 Usar en Google Play Console

Una vez que tengas la URL:

1. Ve a [Google Play Console](https://play.google.com/console)
2. Selecciona tu app **Impostor Fútbol**
3. Ve a **Política, apps y contenido** → **Política de privacidad**
4. Pega la URL de tu política de privacidad
5. Guarda los cambios

**Ejemplo de URL para Google Play:**
```
https://tu-usuario.github.io/politica-privacidad-impostor-futbol/
```

---

## 🔄 Actualizar la Política

Si necesitas actualizar la política en el futuro:

1. Edita `politica-privacidad.html` localmente
2. Actualiza la fecha de "Última actualización"
3. Sube el archivo actualizado a GitHub (o tu hosting)
4. La URL permanece igual, pero el contenido se actualiza automáticamente

---

## ⚠️ Notas Importantes

- ✅ La política debe estar **públicamente accesible** (sin login)
- ✅ Debe estar en un formato legible (HTML, PDF, etc.)
- ✅ La URL debe ser **permanente** (no cambiar)
- ✅ Debe estar en el mismo idioma que tu app (o incluir traducciones)

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas para publicar la política:

1. **GitHub Pages no funciona**: Espera 5-10 minutos después de habilitarlo
2. **La página no se ve bien**: Verifica que el HTML está completo
3. **No encuentro Settings**: Asegúrate de que eres el dueño del repositorio
4. **Quiero cambiar la URL**: Puedes usar un dominio personalizado en GitHub Pages

---

**Última actualización**: Enero 2025

