import { Plus } from "lucide-react";

export default function SubeventosView({eventData, eventId}){ 

   
    console.log("id: ", eventId);

    return (
        <section className="subeventos-view min-h-screen flex flex-col p-4">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold mb-6">Sub-eventos</h1>

                <div>
                    <button onClick={() => {
                        if (eventId) {
                        window.location.href = `/createSubevent?eventId=${eventId}`;
                        } else {
                        console.error("Event ID não disponível");
                        alert("Erro: ID do evento não encontrado");
                        }}}
                    className="w-full font-bold text-white text-sm bg-gradient-to-br from-[#8b5cf6] to-[#9333ea]
                        px-6 py-3 rounded-lg inline-flex items-center justify-center gap-2
                        shadow-[0_4px_8px_rgba(124,58,237,0.4)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.55)]
                        transition-all duration-200 cursor-pointer no-underline"
                    >
                    <Plus size={16} /> Criar sub-evento
                    </button>
                </div>

            </div>

            <div className="subeventos-view-content w-full max-w-4xl ">
                
                {eventData.subeventos && eventData.subeventos.length > 0 ? (
                    <ul className="space-y-2">
                        {eventData.subeventos.map((subevento) => (
                            <li key={subevento.id} className="border-b pb-2">
                                <h3 className="text-lg font-semibold">{subevento.nome}</h3>
                                <p className="text-gray-600">{subevento.descricao}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Nenhum subevento encontrado.</p>
                )}
            </div>
        </section>
    )
}