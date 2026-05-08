export default function Footer() {
  return (
    <footer className="absolute bottom-0 w-full bg-background border-t border-border">
      <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-4 md:px-6 pt-3 md:pt-3 pb-3 md:pb-6">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SigmaBuilder. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
