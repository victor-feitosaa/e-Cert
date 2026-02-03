import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const userId = "148ac370-e45e-4482-a4f5-dff6170a31ce";

const events = [
    {    title: "Evento de Tecnologia", 
        description: "Um evento sobre as últimas tendências em tecnologia.", 
        date: new Date("2024-07-15T10:00:00Z"), 
        createdBy: userId,
    },
    {    title: "Workshop de Desenvolvimento Web", 
        description: "Aprenda as melhores práticas de desenvolvimento web.", 
        date: new Date("2024-08-20T14:00:00Z"), 
        createdBy: userId,
    },
    {    title: "Conferência de Startups", 
        description: "Networking e palestras com fundadores de startups.", 
        date: new Date("2024-09-10T09:00:00Z"), 
        createdBy: userId,
    },
];

const main = async () => {
    for (const event of events) {
        await prisma.event.create({
            data: event,
        });
        console.log(`Evento criado: ${event.title}`);
    }
    console.log("Seed data inserted successfully.");
};

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });;

