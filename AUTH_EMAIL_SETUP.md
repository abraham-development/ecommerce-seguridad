# Correo de autenticación: Hostinger + Supabase OTP

Esta configuración aplica a los correos enviados por **Supabase Auth** para
confirmar cuentas, recuperar contraseñas y notificar cambios de seguridad.
Ninguna contraseña SMTP debe guardarse en este repositorio.

## 1. Verificar el dominio en Hostinger

En hPanel, abrir **Emails → afcrseguridad.com → Connect Domain** y confirmar que
los registros MX, SPF, DKIM y DMARC estén correctos. Si el DNS no usa los
nameservers de Hostinger, copiar los valores exactos indicados por hPanel al
proveedor DNS.

## 2. Configurar SMTP en Supabase

En **Authentication → SMTP Settings**, activar Custom SMTP y completar:

| Campo | Valor |
|---|---|
| Sender email | `contacto@afcrseguridad.com` |
| Sender name | `AFCR Seguridad` |
| Host | `smtp.hostinger.com` |
| Port | `587` |
| Username | `contacto@afcrseguridad.com` |
| Password | Contraseña actual del buzón en Hostinger |

El puerto 587 usa TLS/STARTTLS. La contraseña se introduce únicamente en el
panel de Supabase; no se agrega a `.env.local`, al código ni a GitHub.

En **Authentication → Sign In / Providers → Email**:

- Mantener Email habilitado.
- Mantener **Confirm email** habilitado.
- Configurar el mínimo de contraseña en **8 caracteres**.
- Configurar **Email OTP expiration** en `600` segundos.
- Mantener al menos 60 segundos entre solicitudes de correo.

En **Authentication → Rate Limits**, comenzar con 30 correos por hora o un
valor menor que el límite del plan de Hostinger.

## 3. Plantilla “Confirm signup”

Asunto:

```text
Tu código de verificación de AFCR Seguridad
```

Contenido HTML:

```html
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <h2 style="color:#2563eb">Confirmá tu cuenta en AFCR Seguridad</h2>
  <p>Usá este código de 8 dígitos para verificar tu correo:</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">
    {{ .Token }}
  </p>
  <p>El código vence en 10 minutos.</p>
  <p style="color:#64748b;font-size:13px">
    Si no creaste esta cuenta, podés ignorar este mensaje.
  </p>
</div>
```

## 4. Plantilla “Reset password”

Asunto:

```text
Código para restablecer tu contraseña
```

Contenido HTML:

```html
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <h2 style="color:#2563eb">Restablecé tu contraseña</h2>
  <p>Usá este código de 8 dígitos para continuar:</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">
    {{ .Token }}
  </p>
  <p>El código vence en 10 minutos.</p>
  <p style="color:#64748b;font-size:13px">
    Si no solicitaste este cambio, ignorá el mensaje y no compartas el código.
  </p>
</div>
```

## 5. Notificación “Password changed”

Activar la notificación de seguridad por contraseña modificada y usar:

```html
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
  <h2 style="color:#2563eb">Tu contraseña fue actualizada</h2>
  <p>La contraseña de tu cuenta de AFCR Seguridad se cambió correctamente.</p>
  <p style="color:#64748b;font-size:13px">
    Si no realizaste este cambio, recuperá tu contraseña y contactanos de inmediato.
  </p>
</div>
```

## 6. Prueba operativa

1. Crear una cuenta con un correo de prueba que no pertenezca al equipo de Supabase.
2. Confirmar que llega el código, que tiene 8 dígitos y que solo funciona una vez.
3. Probar “Olvidaste tu contraseña”, cambiarla y comprobar que la contraseña
   anterior deja de funcionar.
4. Revisar **Supabase → Logs → Auth** y los encabezados del mensaje para validar
   SPF, DKIM y DMARC.

Referencias:

- <https://supabase.com/docs/guides/auth/auth-smtp>
- <https://supabase.com/docs/guides/auth/auth-email-templates>
- <https://support.hostinger.com/en/articles/1575756-how-to-get-email-account-configuration-details-for-hostinger-email>
