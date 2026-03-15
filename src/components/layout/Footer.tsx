import Link from "next/link";
import { Shield, Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1E293B] border-t border-slate-700/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shield className="h-7 w-7 text-[#2563EB]" />
              <span className="font-bold text-white text-lg">
                AFCR <span className="text-[#2563EB]">Seguridad</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Especialistas en sistemas de videovigilancia y seguridad
              electrónica. Más de 10 años protegiendo hogares y empresas.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Categorías
            </h3>
            <ul className="space-y-2">
              {[
                ["Cámaras IP", "/categorias/camaras-ip"],
                ["Cámaras Domo", "/categorias/domo"],
                ["Cámaras PTZ", "/categorias/ptz"],
                ["Exterior", "/categorias/exterior"],
                ["Interior", "/categorias/interior"],
                ["NVR/DVR", "/categorias/nvr-dvr"],
                ["Accesorios", "/categorias/accesorios"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Mi Cuenta
            </h3>
            <ul className="space-y-2">
              {[
                ["Iniciar Sesión", "/login"],
                ["Registrarse", "/registro"],
                ["Mis Pedidos", "/cuenta/pedidos"],
                ["Mi Perfil", "/cuenta/perfil"],
                ["Carrito", "/carrito"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 mt-0.5 text-[#2563EB] flex-shrink-0" />
                <span>Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-4 w-4 text-[#2563EB] flex-shrink-0" />
                <a href="tel:+541100000000" className="hover:text-white transition-colors">
                  +54 11 0000-0000
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 text-[#2563EB] flex-shrink-0" />
                <a
                  href="mailto:info@afcrseguridad.com"
                  className="hover:text-white transition-colors"
                >
                  info@afcrseguridad.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AFCR Seguridad. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
