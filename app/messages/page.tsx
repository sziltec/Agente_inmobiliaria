// Estado vacío de la bandeja de Mensajes: nada seleccionado todavía.
export default function MessagesIndexPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-muted-foreground">
        Seleccioná una conversación para ver los mensajes.
      </p>
    </div>
  );
}
