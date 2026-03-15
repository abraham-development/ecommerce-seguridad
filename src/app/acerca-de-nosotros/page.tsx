import type { Metadata } from "next";
import { Shield, Award, Users, Phone, Mail, MapPin, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Acerca de Nosotros",
  description:
    "Conocé la historia de AFCR Seguridad, especialistas en sistemas de videovigilancia y seguridad electrónica en Argentina.",
};

export default function AcercaDeNosotrosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.12),_transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-[#2563EB]" />
            <span className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider">
              AFCR Seguridad
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Protegiendo lo que más{" "}
            <span className="text-[#2563EB]">te importa</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Somos especialistas en sistemas de videovigilancia y seguridad
            electrónica. Más de 10 años de experiencia brindando soluciones
            confiables a hogares y empresas de toda Argentina.
          </p>
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              ¿Quiénes somos?
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                AFCR Seguridad nació en 2015 con la misión de democratizar el
                acceso a sistemas de videovigilancia de calidad profesional.
                Comenzamos como una pequeña empresa familiar en Buenos Aires y
                hoy somos distribuidores autorizados de las principales marcas
                del mercado.
              </p>
              <p>
                Nuestro equipo está formado por técnicos certificados con años
                de experiencia en instalación, configuración y mantenimiento de
                sistemas de seguridad electrónica. Ofrecemos asesoramiento
                personalizado para encontrar la solución que mejor se adapta a
                cada necesidad y presupuesto.
              </p>
              <p>
                Trabajamos con las marcas más reconocidas del sector: Hikvision,
                Dahua, Axis, Reolink, Ezviz y TP-Link Tapo, garantizando
                siempre la mejor calidad y soporte técnico post-venta.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {[
                "Distribuidores autorizados oficiales",
                "Instalación y puesta en marcha",
                "Soporte técnico 365 días",
                "Garantía en todos los productos",
                "Financiación disponible",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#2563EB] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "10+", label: "Años de experiencia", icon: "🏆" },
              { value: "5,000+", label: "Clientes satisfechos", icon: "👥" },
              { value: "200+", label: "Productos disponibles", icon: "📷" },
              { value: "6", label: "Marcas líderes", icon: "⭐" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 text-center"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-3xl font-bold text-[#2563EB]">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-[#1E293B] border-y border-slate-700/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Nuestros valores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Award className="h-8 w-8 text-[#2563EB]" />,
                title: "Calidad",
                desc: "Solo comercializamos productos de marcas reconocidas mundialmente, con certificaciones internacionales y garantía oficial.",
              },
              {
                icon: <Shield className="h-8 w-8 text-[#F97316]" />,
                title: "Confianza",
                desc: "Más de una década brindando soluciones de seguridad confiables. Nuestros clientes nos recomiendan por nuestra honestidad y transparencia.",
              },
              {
                icon: <Users className="h-8 w-8 text-[#2563EB]" />,
                title: "Servicio",
                desc: "Asesoramiento personalizado antes, durante y después de la compra. Nuestro equipo técnico está siempre disponible para ayudarte.",
              },
            ].map((val) => (
              <div
                key={val.title}
                className="bg-[#0F172A] rounded-2xl p-8 border border-slate-700/50"
              >
                <div className="mb-4">{val.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          ¿Tenés alguna consulta?
        </h2>
        <p className="text-slate-400 text-center mb-12">
          Nuestro equipo está listo para asesorarte sin compromiso.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Phone className="h-6 w-6 text-[#2563EB]" />,
              label: "Teléfono",
              value: "+54 11 0000-0000",
              href: "tel:+541100000000",
            },
            {
              icon: <Mail className="h-6 w-6 text-[#2563EB]" />,
              label: "Email",
              value: "info@afcrseguridad.com",
              href: "mailto:info@afcrseguridad.com",
            },
            {
              icon: <MapPin className="h-6 w-6 text-[#2563EB]" />,
              label: "Ubicación",
              value: "Buenos Aires, Argentina",
              href: "#",
            },
          ].map((contact) => (
            <a
              key={contact.label}
              href={contact.href}
              className="bg-[#1E293B] border border-slate-700 hover:border-[#2563EB]/50 rounded-2xl p-6 text-center transition-colors group"
            >
              <div className="flex justify-center mb-3">{contact.icon}</div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                {contact.label}
              </p>
              <p className="text-white font-medium group-hover:text-[#2563EB] transition-colors">
                {contact.value}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
