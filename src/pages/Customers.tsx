import { MobileLayout } from "@/components/layout/MobileLayout";
import { CustomerCard } from "@/components/CustomerCard";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

interface Customer {
  id?: string;
  name: string;
  address: string;
  phone: string;
  status: "visited" | "pending" | "overdue";
  lastVisit: string;
  outstanding: string;
}

type Filter = "all" | "visited" | "pending" | "overdue";

import { getDB } from "@/lib/db";

const Customers = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!navigator.onLine) {
        const db = await getDB();
        return await db.getAll('customers');
      }
      try {
        const res = await apiFetch('/api/customers');
        if (!res.ok) throw new Error("Failed to fetch customers");
        return res.json();
      } catch (err) {
        const db = await getDB();
        return await db.getAll('customers');
      }
    }
  });

  const filtered = customers.filter(c => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <MobileLayout>
      <header className="bg-card border-b border-border px-5 pt-6 pb-4">
        <h1 className="text-lg font-heading font-bold text-foreground mb-3">Customers</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-lg bg-muted pl-9 pr-3 text-sm font-body text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1.5 mt-3 overflow-x-auto">
          {(["all", "pending", "visited", "overdue"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-body font-medium px-3 py-1 rounded-full whitespace-nowrap transition-colors ${filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === "all" ? `(${customers.length})` : `(${customers.filter((c) => c.status === f).length})`}
            </button>
          ))}
        </div>
      </header>
      <div className="px-4 py-3 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin opacity-20 mb-2" />
            <p className="text-sm">Loading customers...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((c) => (
            <CustomerCard key={c.id || c.name} {...c} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">No customers found</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Customers;
