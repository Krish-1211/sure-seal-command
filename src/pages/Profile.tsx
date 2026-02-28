import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, User, Mail, Phone, MapPin, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <MobileLayout>
            <header className="bg-card border-b border-border px-5 pt-6 pb-4 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-heading font-bold text-foreground">My Profile</h1>
            </header>

            <div className="px-4 py-6 space-y-6">
                {/*  Avatar */}
                <div className="flex flex-col items-center justify-center pt-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black font-heading shadow-sm mb-4 border border-primary/20">
                        {user?.name?.split(" ").map(n => n[0]).join("")}
                    </div>
                    <h2 className="text-xl font-heading font-bold">{user?.name}</h2>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{user?.role === "admin" ? "Administrator" : "Sales Representative"}</p>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm space-y-4">
                    <h3 className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider">Account Details</h3>

                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1"><User className="h-3 w-3" /> Full Name</label>
                            <input type="text" defaultValue={user?.name || ""} className="w-full h-11 bg-muted rounded-xl px-4 text-sm font-medium outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1"><Mail className="h-3 w-3" /> Email Address</label>
                            <input type="email" defaultValue={`${user?.name?.split(" ")[0].toLowerCase()}@sureseal.com.au`} className="w-full h-11 bg-muted rounded-xl px-4 text-sm font-medium outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1"><Phone className="h-3 w-3" /> Phone Number</label>
                            <input type="tel" defaultValue="+61 400 123 456" className="w-full h-11 bg-muted rounded-xl px-4 text-sm font-medium outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1"><MapPin className="h-3 w-3" /> Designated Region</label>
                            <input type="text" disabled defaultValue="National (All Regions)" className="w-full h-11 bg-muted rounded-xl px-4 text-sm font-medium outline-none opacity-60" />
                        </div>
                        {user?.role === "admin" && (
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1"><Shield className="h-3 w-3" /> Administrative Role</label>
                                <input type="text" disabled defaultValue="Full Access Owner" className="w-full h-11 bg-muted rounded-xl px-4 text-sm font-medium outline-none opacity-60" />
                            </div>
                        )}
                    </div>
                </div>

                <Button onClick={() => { toast.success("Profile details updated!"); navigate(-1); }} className="w-full h-12 rounded-xl text-sm font-bold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                    Save Changes
                </Button>
            </div>
        </MobileLayout>
    );
}
