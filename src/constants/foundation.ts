export const FOUNDATION = {
  name: "Fundación Principio & Fin",
  slogans: [
    "Podemos sanar y volver a comenzar",
    "Conectamos talentos, transformamos futuros",
    "Amor · Fe · Esperanza"
  ],
  contact: {
    phone: "300 909 6862",
    whatsappUrl: "https://api.whatsapp.com/send?phone=573009096862",
    email: "f.principioyfin@gmail.com",
    address: "Cra. 73 H Bis # 76 – 65 Sur, Bogotá D.C."
  },
  social: {
    facebook: "Fundación Principio y Fin",
    instagram: "@f.principioyfin"
  },
  routes: {
    home: "/",
    about: "/quienes-somos",
    programs: "/programas",
    horizontalProperty: "/propiedad-horizontal",
    donations: "/donaciones",
    contact: "/contacto",
    enrollment: "/inscripcion"
  }
} as const;
