import { CalendarDays, ClipboardList, Cog } from "lucide-react";



export default function EditarEvent({eventData}){


function parseEventDateTime(isoString) {
  const date = new Date(isoString);

  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  const formattedTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  return { date: formattedDate, time: formattedTime };
}

const { date, time } = parseEventDateTime(eventData.date);

    return (
        <section >
            <form className="flex gap-6" action="">
                <div className="w-1/2 bg-sidebar border border-border rounded-md">

                    <div className="flex p-4 items-center gap-2">
                        <ClipboardList size={20} className=" text-primary" />
                        <h3 className="font-extrabold">Informações principais</h3>
                    </div>
                    
                        
                        <div>
                            <fieldset className="flex flex-col gap-1 p-4 ">
                                <label htmlFor="title" className="text-sm font-bold">Nome do evento</label>
                                <input type="text " className="p-4 border rounded-md text-sm border-border" value={eventData.title}  />
                            </fieldset>      
                            
                            <fieldset className="flex flex-col gap-1 p-4 ">
                                <label htmlFor="title" className="text-sm font-bold">Descrição</label>
                                <textarea type="text " className="p-4 resize-none h-40 border rounded-md text-sm border-border" value={eventData.description}  />
                            </fieldset>      

                            <fieldset className="flex flex-col gap-1 p-4 ">
                                <label htmlFor="title" className="text-sm font-bold">Local</label>
                                <input type="text " className="p-4 border rounded-md text-sm border-border" value={eventData.location}  />
                            </fieldset>      

                        </div>          

                    

                </div>

                <div className="w-1/2 flex flex-col gap-4">

                    <div className="bg-sidebar border border-border rounded-md w-full h-1/2">
                        <div className="flex p-4 items-center gap-2">
                            <CalendarDays  size={20} className=" text-primary"  />
                            <h3 className="font-extrabold">Data & Horário</h3>
                        </div>

                        <div className="flex flex-col">

                            <div className="flex justify-between">
                                <fieldset className="flex flex-col gap-1 p-4 w-1/2">
                                    <label htmlFor="inital-date">Data de início </label>
                                    <input type="date"  placeholder="**/**/****" value={date} className="p-4 border rounded-md text-sm  border-border"  />
                                </fieldset>

                                <fieldset className="flex flex-col gap-1 p-4 w-1/2">
                                    <label htmlFor="inital-date">Horário </label>
                                    <input type="time"  placeholder="" value={time} className="p-4 border rounded-md text-sm border-border"  />
                                </fieldset>

                            </div>

                        </div>



                    </div>

                    <div className="bg-sidebar border border-border rounded-md w-full h-1/2">
                        <div className="flex p-4 items-center gap-2">
                            <Cog  size={20} className=" text-primary"  />
                            <h3 className="font-extrabold">Configurações</h3>
                        </div>
                    </div>

                </div>

            </form>
        </section>
    )
}