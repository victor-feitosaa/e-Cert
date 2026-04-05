import EventCard from "../EventCard";

export default function MyEvents({ userData , eventsData}) {
  
  const events = eventsData?.data?.events ?? [];

  return (
    <div className="min-h-screen">
      <div className="w-full bg-background p-6">
        <h1 className="text-lg font-bold text-white">Meus Eventos</h1>
      </div>
      <hr />

      <section id="data" className="text-accent-foreground my-5 p-6 flex flex-col gap-10">
        <div className="font-bold flex flex-col gap-4">
          <h2 className="text-3xl">Olá, <span className="text-primary font-extrabold">{userData.data.data?.name ?? "..."}</span> !</h2> 
          <h4 className="text-md">Você têm <span className="text-primary font-extrabold ">{events.length  ?? "0"}</span> eventos próximos</h4>
        </div>


        
        <div className="bg-background z-10 w-full h-[60vh] overflow-auto flex flex-col gap-3">
          {events.lenght === 0 ? (
            <p className="text-muted-foreground">Nenhum evento encontrado.</p>
          ) : (
            events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}

        </div>

      </section>


    </div>
  );
}