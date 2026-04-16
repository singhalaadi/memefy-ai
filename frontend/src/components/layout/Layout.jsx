import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import { useTheme } from "../../context/ThemeContext";

const Layout = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]"
          : "bg-gradient-to-br from-[#f0f9ff] via-[#e0e7ff] to-[#f8fafc]"
      }`}
    >
      <Navbar />
      <main className="pb-20 md:pb-16 px-4 md:px-0">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
};
export default Layout;