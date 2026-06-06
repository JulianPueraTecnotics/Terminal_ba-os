/**
 * Oculta solo navbar y footer del portal; mantiene facturación POS y caja web.
 */
export const HIDE_PORTAL_CHROME_SCRIPT = `
(function () {
  function apply() {
    var id = 'terminal-banos-hide-chrome';
    if (!document.getElementById(id)) {
      var style = document.createElement('style');
      style.id = id;
      style.textContent = [
        'nav.navbar-close,',
        '.footer-secondary,',
        '.footer {',
        '  display: none !important;',
        '  visibility: hidden !important;',
        '  height: 0 !important;',
        '  min-height: 0 !important;',
        '  overflow: hidden !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '}',
        '.facturacion-page { padding-top: 0 !important; }',
        '.facturacion-container { padding-top: 8px !important; }',
        '.facturacion-billing-root { display: block !important; visibility: visible !important; }',
        'body { padding-top: 0 !important; }',
      ].join('\\n');
      document.head.appendChild(style);
    }

    var billing = document.querySelector('.facturacion-billing-root');
    if (billing) {
      billing.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  apply();
  setTimeout(apply, 400);
  setTimeout(apply, 1200);
  setTimeout(apply, 2500);
  true;
})();
`;

export function buildPortalAuthScript(token: string, feName: string): string {
  return `
    try {
      localStorage.setItem('token', ${JSON.stringify(token)});
      localStorage.setItem('fe_name', ${JSON.stringify(feName || '')});
    } catch (e) {}
    true;
  `;
}
