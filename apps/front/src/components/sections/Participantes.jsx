export default function Overview({ eventId, eventData }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-sidebar/50 rounded-lg p-6 border border-sidebar">
                    <h3 className="text-sm text-accent-foreground mb-2">Total de Participantes</h3>
                    <p className="text-3xl font-bold text-primary">147</p>
                </div>
                <div className="bg-sidebar/50 rounded-lg p-6 border border-sidebar">
                    <h3 className="text-sm text-accent-foreground mb-2">Certificados Emitidos</h3>
                    <p className="text-3xl font-bold text-primary">98</p>
                </div>
                <div className="bg-sidebar/50 rounded-lg p-6 border border-sidebar">
                    <h3 className="text-sm text-accent-foreground mb-2">Taxa de Presença</h3>
                    <p className="text-3xl font-bold text-primary">67%</p>
                </div>
            </div>
            
            <div className="bg-sidebar/50 rounded-lg p-6 border border-sidebar">
                <h3 className="text-lg font-semibold mb-4">Informações do Evento</h3>
                <p className="text-accent-foreground">{eventData.description}</p>
            </div>
        </div>
    );
}