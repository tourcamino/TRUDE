import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  gradient: string;
}

export function StatCard({ icon: Icon, label, value, subValue, gradient }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 transition-opacity group-hover:opacity-10`}></div>
      <div className="relative">
        <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <p className="mb-1 text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subValue && <p className="mt-1 text-sm text-gray-500">{subValue}</p>}
      </div>
    </div>
  );
}
