import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SyncService } from "@/services/sync.service";

// Initialize the sync engine (recovers zombie items, starts background sync)
SyncService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
