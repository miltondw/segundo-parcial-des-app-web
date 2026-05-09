import { createRouter, createWebHistory } from "vue-router";

const LoginView = () => import("../views/LoginView.vue");
const DashboardView = () => import("../views/DashboardView.vue");
const ProductView = () => import("../views/ProductView.vue");

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "Login", component: LoginView },
  // Compatibilidad: redirigir accesos a /admin hacia dashboard
  { path: "/admin", redirect: "/dashboard" },
  // Compatibilidad: redirigir accesos a /client hacia dashboard
  { path: "/client", redirect: "/dashboard" },
  {
    path: "/dashboard",
    component: DashboardView,
    children: [
      { path: "", redirect: "/dashboard/peliculas" },
      { path: "peliculas", name: "Peliculas", component: ProductView }, // This line remains unchanged
      {
        path: "reservas",
        name: "Reservas",
        component: () => import("../views/ReservationsView.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
