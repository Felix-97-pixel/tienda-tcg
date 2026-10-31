import http from 'http';
import url from 'url';
import tbk from 'transbank-sdk';

const { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } = tbk;

const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
);

const PORT = 9999;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Panel de Validación Webpay Plus</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #f1f5f9; margin: 0; padding: 2rem 1rem; display: flex; justify-content: center; }
          .container { max-width: 850px; width: 100%; }
          .header { text-align: center; margin-bottom: 2rem; }
          h1 { color: #f43f5e; font-size: 1.8rem; margin-bottom: 0.5rem; }
          .subtitle { color: #94a3b8; font-size: 0.95rem; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
          .card { background: #131c2e; border: 1px solid #1e293b; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; }
          .card:hover { border-color: #38bdf8; }
          .card-highlight { border: 2px solid #38bdf8; background: #0f233f; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem; }
          .badge-green { background: #064e3b; color: #34d399; }
          .badge-red { background: #4c0519; color: #fb7185; }
          .badge-yellow { background: #451a03; color: #fcd34d; }
          .badge-blue { background: #0369a1; color: #7dd3fc; }
          .card-title { font-size: 1.1rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.5rem; }
          .details { background: #0b1120; border-radius: 8px; padding: 0.75rem; font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin: 0.75rem 0; }
          .details strong { color: #cbd5e1; }
          .details code { background: #1e293b; color: #38bdf8; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9rem; }
          .btn { display: block; text-align: center; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; transition: background 0.15s; }
          .btn:hover { background: #1d4ed8; }
          .btn-danger { background: #e11d48; }
          .btn-danger:hover { background: #be123c; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Panel de Validación Webpay Plus (Transbank)</h1>
            <p class="subtitle">Haz clic en la prueba correspondiente, realiza el pago y copia el Token que te mostrará la pantalla.</p>
          </div>

          <div class="grid">
            <!-- Prueba 1 -->
            <div class="card">
              <div>
                <span class="badge badge-green">Aprobar • Crédito</span>
                <div class="card-title">1. Crédito Sin Cuotas</div>
                <div class="details">
                  • Tarjeta: <strong>Visa</strong><br>
                  • Número: <code>4051 8856 0044 6623</code><br>
                  • CVV: <code>123</code> | Vencimiento: <code>12/28</code><br>
                  • Cuotas: <strong>Sin cuotas</strong>
                </div>
              </div>
              <a href="/start" class="btn">Ejecutar Prueba 1 →</a>
            </div>

            <!-- Prueba 2 -->
            <div class="card">
              <div>
                <span class="badge badge-red">Rechazar • Crédito</span>
                <div class="card-title">2. Crédito Sin Cuotas (Rechazo)</div>
                <div class="details">
                  • Tarjeta: <strong>Mastercard</strong><br>
                  • Número: <code>5186 0595 5959 0568</code><br>
                  • CVV: <code>123</code> | Vencimiento: <code>12/28</code><br>
                  • Cuotas: <strong>Sin cuotas</strong>
                </div>
              </div>
              <a href="/start" class="btn btn-danger">Ejecutar Prueba 2 →</a>
            </div>

            <!-- Prueba 3 (LA QUE FALLÓ) -->
            <div class="card card-highlight">
              <div>
                <span class="badge badge-blue">¡La que falló! • Con Cuotas</span>
                <div class="card-title" style="color:#38bdf8;">3. Crédito Con Cuotas (Aprobar)</div>
                <div class="details" style="background:#091629;">
                  • Tarjeta: <strong>Visa</strong><br>
                  • Número: <code>4051 8856 0044 6623</code><br>
                  • CVV: <code>123</code> | Vencimiento: <code>12/28</code><br>
                  • En Webpay: Selecciona <strong>3 cuotas</strong> (o 2 cuotas)<br>
                  • Clic en <strong>Pagar</strong> y espera el regreso
                </div>
              </div>
              <a href="/start" class="btn" style="background:#0284c7;">Ejecutar Prueba 3 (Cuotas) →</a>
            </div>

            <!-- Prueba 4 -->
            <div class="card">
              <div>
                <span class="badge badge-green">Aprobar • Débito</span>
                <div class="card-title">4. Débito / Redcompra</div>
                <div class="details">
                  • Tarjeta: <strong>Redcompra</strong><br>
                  • Número: <code>4051 8842 3993 7763</code><br>
                  • Clave en pantalla: Cualquier clave (ej: <code>1234</code>)<br>
                  • Resultado esperado: <strong>Aprobar</strong>
                </div>
              </div>
              <a href="/start" class="btn">Ejecutar Prueba 4 →</a>
            </div>

            <!-- Prueba 5 -->
            <div class="card">
              <div>
                <span class="badge badge-red">Rechazar • Débito</span>
                <div class="card-title">5. Débito / Redcompra (Rechazo)</div>
                <div class="details">
                  • Tarjeta: <strong>Redcompra</strong><br>
                  • Número: <code>5186 0085 4123 3829</code><br>
                  • Clave en pantalla: Cualquier clave (ej: <code>1234</code>)<br>
                  • Resultado esperado: <strong>Rechazar</strong>
                </div>
              </div>
              <a href="/start" class="btn btn-danger">Ejecutar Prueba 5 →</a>
            </div>

            <!-- Prueba 6 -->
            <div class="card">
              <div>
                <span class="badge badge-yellow">Cancelar por Usuario</span>
                <div class="card-title">6. Transacción Cancelada</div>
                <div class="details">
                  • Al entrar a Webpay, <strong>NO pagues</strong>.<br>
                  • Haz clic abajo en <strong>"Anular compra y volver al comercio"</strong>.<br>
                  • Transbank devolverá la transacción abortada.
                </div>
              </div>
              <a href="/start" class="btn" style="background:#d97706;">Ejecutar Prueba 6 →</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    return;
  }

  if (pathname === '/start') {
    const buyOrder = 'VAL-' + Math.floor(Math.random() * 1000000);
    const sessionId = 'SES-' + Math.floor(Math.random() * 1000000);
    const amount = 10000;
    const returnUrl = `http://localhost:${PORT}/return`;

    try {
      const createRes = await tx.create(buyOrder, sessionId, amount, returnUrl);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Redirigiendo a Webpay...</title></head>
        <body style="background:#090d16; color:#fff; font-family:system-ui; display:flex; align-items:center; justify-content:center; height:100vh;">
          <div style="text-align:center;">
            <h2>Redirigiendo a Webpay de prueba...</h2>
            <p style="color:#94a3b8;">Token: <code>${createRes.token}</code></p>
            <form id="payForm" method="POST" action="${createRes.url}">
              <input type="hidden" name="token_ws" value="${createRes.token}" />
            </form>
            <script>document.getElementById('payForm').submit();</script>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Error al crear transacción: ' + err.message);
    }
    return;
  }

  if (pathname === '/return') {
    const token = parsedUrl.query.token_ws;
    const tbkToken = parsedUrl.query.TBK_TOKEN;

    if (tbkToken) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Transacción Cancelada</title>
          <style>
            body { font-family: system-ui; background: #090d16; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
            .card { background: #131c2e; padding: 2.5rem; border-radius: 12px; max-width: 650px; text-align: center; border: 1px solid #ca8a04; }
            .token-box { background: #0b1120; padding: 18px; border-radius: 8px; font-family: monospace; font-size: 1.1rem; color: #facc15; word-break: break-all; margin: 25px 0; border: 2px dashed #ca8a04; user-select: all; cursor: text; }
            .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 18px; font-weight: 600; border-radius: 6px; text-decoration: none; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <span style="background:#451a03; color:#fcd34d; padding:4px 12px; border-radius:9999px; font-weight:bold; font-size:0.85rem;">Prueba 6 • Cancelada por Usuario</span>
            <h1 style="color:#facc15; margin-top:1rem;">¡Cancelación Registrada!</h1>
            <p>Copia el siguiente <strong>Token</strong> y pégalo en el Typeform:</p>
            <div class="token-box">${tbkToken}</div>
            <a href="/" class="btn">← Volver al Panel</a>
          </div>
        </body>
        </html>
      `);
      return;
    }

    if (!token) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No se recibió token_ws');
      return;
    }

    let commitRes = null;
    let isError = false;
    let errorMessage = '';

    try {
      commitRes = await tx.commit(token);
    } catch (err) {
      isError = true;
      errorMessage = err.message;
    }

    const isAuthorized = !isError && commitRes && commitRes.status === 'AUTHORIZED' && commitRes.response_code === 0;
    const badgeColor = isAuthorized ? '#064e3b' : '#4c0519';
    const textColor = isAuthorized ? '#34d399' : '#fb7185';
    const borderColor = isAuthorized ? '#10b981' : '#e11d48';
    const statusTitle = isAuthorized ? '¡Transacción AUTORIZADA (AUTHORIZED)!' : '¡Transacción RECHAZADA / FALLIDA (FAILED)!';

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${statusTitle}</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
          .card { background: #131c2e; border-radius: 12px; padding: 2.5rem; max-width: 650px; text-align: center; border: 2px solid ${borderColor}; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          h1 { color: ${textColor}; margin-top: 1rem; font-size: 1.5rem; }
          p { color: #cbd5e1; line-height: 1.5; font-size: 1rem; }
          .token-box { background: #0b1120; padding: 18px; border-radius: 8px; font-family: monospace; font-size: 1.15rem; color: ${textColor}; word-break: break-all; margin: 25px 0; border: 2px dashed ${borderColor}; user-select: all; cursor: text; }
          .status-badge { display: inline-block; background: ${badgeColor}; color: ${textColor}; padding: 6px 14px; border-radius: 9999px; font-weight: bold; font-size: 0.9rem; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 18px; font-size: 0.95rem; font-weight: 600; border-radius: 6px; text-decoration: none; margin-top: 15px; }
          .btn:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="status-badge">ESTADO: ${commitRes ? commitRes.status : 'ERROR'} (Código ${commitRes ? commitRes.response_code : '-1'})</span>
          <h1>${statusTitle}</h1>
          <p>
            ${isAuthorized 
              ? 'Transacción completada con éxito. Copia este <strong>Token</strong> y pégalo en el formulario:' 
              : 'Esta transacción finalizó como rechazada. Copia este <strong>Token</strong> si la prueba pedía rechazar:'}
          </p>
          
          <div class="token-box">${token}</div>

          <p style="font-size: 0.85rem; color: #94a3b8;">
            ${commitRes ? `Cuotas: ${commitRes.installments_number || 'Sin cuotas'} | Monto: $${commitRes.amount} | Tipo: ${commitRes.payment_type_code} | Aut: ${commitRes.authorization_code}` : errorMessage}
          </p>

          <a href="/" class="btn">← Volver al Panel</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Validador corriendo en http://localhost:${PORT}`);
});

