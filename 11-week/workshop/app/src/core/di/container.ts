// Composition root: core/ no conoce las features (project-structure.md), así que este bolsillo
// se queda genérico. Quien arma el árbol de la app (App.tsx) es quien mete las implementaciones
// concretas de cada feature; cada feature lee lo suyo con su propio hook tipado sobre useDI().
export type Container = Record<string, unknown>
