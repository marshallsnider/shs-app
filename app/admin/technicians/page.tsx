import prisma from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Plus } from "lucide-react";
import { createTechnician } from "../../actions"; // Adjust import path

export default async function TechniciansPage() {
    const technicians = (await prisma.technician.findMany()) || [];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Technicians</h2>

                {/* Simple Add Form (In a modal ideally, but inline for MVP speed) */}
                <form action={createTechnician} className="flex gap-2">
                    <input
                        type="text"
                        name="name"
                        placeholder="New Tech Name"
                        className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-primary"
                        required
                    />
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Tech
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {technicians.map(tech => (
                    <Card key={tech.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg font-bold text-white border border-white/10">
                                {tech.avatar || tech.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{tech.name}</h3>
                                <p className="text-xs text-slate-500">Started {tech.startDate.toLocaleDateString()}</p>
                                <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${tech.isActive ? 'bg-success/20 text-success' : 'bg-slate-700 text-slate-400'}`}>
                                    {tech.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </div>
                            </div>
                        </div>

                        <button className="text-slate-400 hover:text-white text-sm">Edit</button>
                    </Card>
                ))}

                {technicians.length === 0 && (
                    <div className="col-span-full p-8 text-center text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                        No technicians found. Add one above.
                    </div>
                )}
            </div>
        </div>
    );
}
