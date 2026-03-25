import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Voting from "./pages/Voting";
import Budget from "./pages/Budget";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </BrowserRouter>
  );
}