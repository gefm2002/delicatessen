export default function Footer() {
  return (
    <footer className="bg-bg-alt border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Delicatessen</h3>
            <p className="text-sm text-text-muted">
              Tu súper de confianza, promos y boxes para regalar.
            </p>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Sucursales</h3>
            <ul className="text-sm text-text-muted space-y-2">
              <li>Rivadavia & Belgrano</li>
              <li>Jorge Newbery & Paz</li>
            </ul>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Contacto</h3>
            <p className="text-sm text-text-muted mb-4">
              Seguinos en nuestras redes
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/delicatessenVT/?locale=es_LA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-secondary transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-text-muted">
            Diseño y desarrollo por{' '}
            <a
              href="https://structura.com.ar/"
              target="_blank"
              rel="noopener"
              className="text-text-muted hover:underline"
            >
              Structura
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
