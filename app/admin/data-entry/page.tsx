import prisma from "@/lib/db";
import { DataEntryForm } from "./DataEntryForm";

export default async function DataEntryPage() {
    const technicians = await prisma.technician.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Weekly Data Entry</h2>
            <DataEntryForm technicians={technicians} />
        </div>
    );
}
