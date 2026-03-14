import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, User } from "lucide-react";
import { requestFirebaseToken } from "@/lib/firebase";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Auth State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let fcmToken = null;
            try {
                fcmToken = await requestFirebaseToken();
            } catch (err) {
                console.warn("FCM token request failed", err);
            }

            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.toLowerCase(), password, fcmToken })
            });

            if (res.ok) {
                const { token, user } = await res.json();
                login(user, token);
                
                // 6.1 Customer Portal Redirection
                if (user.role === 'customer') {
                    navigate("/portal");
                } else {
                    navigate("/dashboard");
                }
                
                toast.success(`Welcome back, ${user.name}!`);
            } else {
                toast.error("Invalid username or password.");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

            <div className="text-center space-y-2 relative z-10 mt-8 mb-6">
                <div className="mx-auto flex items-center justify-center mb-4">
                    <img src="/logo.png" alt="Sure Seal Sealants Logo" className="h-24 w-auto object-contain" />
                </div>
                <h1 className="text-2xl font-heading font-black text-foreground tracking-tight">Sure Seal Sealants</h1>
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
