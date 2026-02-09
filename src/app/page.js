
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LogicFlow from "./components/LogicFlow";
import SplitBrain from "./components/SplitBrain";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";


export default function Home() {
  return (
    <>     
        <Navbar/>
        <Hero/>
        <LogicFlow />
        <SplitBrain/>
        <Pricing/>
        <Footer/>
    </>
    
  );
}
