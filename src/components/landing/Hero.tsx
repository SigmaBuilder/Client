import { Link } from "react-router-dom"

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-32 lg:py-40 text-center">
      <div className="mx-auto max-w-4xl">
        <div className="animate-fade-in delay-100 mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary"></span>
            Proyecto en desarrollo
          </span>
        </div>
        <h1 className="animate-fade-in-up delay-200 text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/70 mb-6">
          Construye proyectos
          <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-sidebar-primary"> dinámicos. </span>
          Sin límites.
        </h1>
        <p className="animate-fade-in-up delay-300 mx-auto mb-10 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          La plataforma para equipos que necesitan crear
          <strong className="text-foreground font-medium"> proyectos con flujos personalizados</strong>,
          modales a medida y estructuras propias. Sin depender de nadie.
        </p>
        <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 bg-primary text-primary-foreground text-base font-semibold transition-all hover:bg-primary/90 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-lg shadow-primary/20"
          >
            Prueba gratis
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
