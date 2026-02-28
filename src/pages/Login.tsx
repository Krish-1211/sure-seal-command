import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, User } from "lucide-react";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Auth State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        const isKevinValid = username.toLowerCase() === "kevin" && password === "kevin123";
        const isScottValid = username.toLowerCase() === "scott" && password === "scott123";

        if (isKevinValid) {
            login("Kevin", "admin");
            navigate("/dashboard");
        } else if (isScottValid) {
            login("Scott Mitchell", "salesman");
            navigate("/dashboard");
        } else {
            toast.error("Invalid username or password.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

            <div className="text-center space-y-2 relative z-10 mt-8 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <span className="text-3xl font-heading font-bold text-primary">SS</span>
                </div>
                <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">Sure Seal</h1>
                <p className="text-muted-foreground font-body text-sm max-w-[250px] mx-auto">Sales Force Automation Platform</p>
            </div>

            <div className="w-full max-w-sm space-y-4 relative z-10">
                <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-border/20">

                    <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                        <div className="text-center space-y-1 mb-6">
                            <h2 className="text-xl font-heading font-bold text-foreground">Sign In</h2>
                            <p className="text-xs text-muted-foreground">Enter your username and password</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full h-12 rounded-xl bg-muted pl-10 pr-4 text-sm font-body text-foreground placeholder:text-muted-foreground/70 border-0 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    autoFocus
                                />
                            </div>

                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 rounded-xl bg-muted pl-10 pr-4 text-sm font-body text-foreground placeholder:text-muted-foreground/70 border-0 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 rounded-xl mt-2 font-heading font-bold text-sm bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">
                                Sign In
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="relative z-10 text-center space-y-1 mt-auto pt-8 pb-4">
                <p className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-widest">Version 1.0.0</p>
                <p className="text-[10px] font-body text-muted-foreground/60">Demo Data Environment</p>
            </div>
        </div>
    );
};

export default Login;
