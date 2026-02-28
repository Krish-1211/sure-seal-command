import { MobileLayout } from "@/components/layout/MobileLayout";
import { ChevronLeft, HelpCircle, Mail, Phone, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HelpSupport() {
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
                <h1 className="text-lg font-heading font-bold text-foreground">Help & Support</h1>
            </header>

            <div className="px-4 py-6 space-y-6">
                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-4 text-center">
                    <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <HelpCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-heading font-bold">How can we help?</h2>
                    <p className="text-sm font-medium text-muted-foreground">Contact the Sure Seal Sealants administrative team for application difficulties or order management problems.</p>

                    <div className="pt-6 grid gap-3">
                        <Button className="w-full justify-start h-14 rounded-2xl bg-muted text-foreground hover:bg-muted/80 shadow-sm gap-3 px-5">
                            <Phone className="h-5 w-5 text-primary" />
                            <div className="text-left flex-1">
                                <p className="font-bold text-sm">Call Support</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">1800 123 456</p>
                            </div>
                        </Button>
                        <Button className="w-full justify-start h-14 rounded-2xl bg-muted text-foreground hover:bg-muted/80 shadow-sm gap-3 px-5">
                            <Mail className="h-5 w-5 text-primary" />
                            <div className="text-left flex-1">
                                <p className="font-bold text-sm">Email Team</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">support@sureseal.com</p>
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
                    <h3 className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Quick Links</h3>
                    <div className="space-y-1">
                        <button className="w-full flex justify-between items-center py-3 px-2 text-sm font-medium hover:bg-muted/50 rounded-lg">
                            <span>FAQs</span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground/50" />
                        </button>
                        <button className="w-full flex justify-between items-center py-3 px-2 text-sm font-medium hover:bg-muted/50 rounded-lg">
                            <span>Video Tutorials</span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground/50" />
                        </button>
                        <button className="w-full flex justify-between items-center py-3 px-2 text-sm font-medium hover:bg-muted/50 rounded-lg">
                            <span>Privacy Policy</span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground/50" />
                        </button>
                    </div>
                </div>
            </div>
        </MobileLayout>
    )
}
