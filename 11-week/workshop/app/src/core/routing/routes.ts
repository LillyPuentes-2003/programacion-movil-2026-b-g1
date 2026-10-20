// Tabla única de rutas (navigation.md). Solo las que ya tienen pantalla: el resto se agrega
// cuando su feature llega (booking, appointments, business). Las rutas van en inglés, igual que
// las de la API (ADR-012).
export const routes = {
  login: {
    path: '/login',
  },
  signUp: {
    path: '/register',
  },
  catalog: {
    path: '/services',
  },
  serviceDetail: {
    path: '/service/:serviceId',
    build: (serviceId: string) => `/service/${serviceId}`,
  },
  myAppointments: {
    path: '/my-appointments',
  },
} as const
