
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LogicFlow from "./components/LogicFlow";
import SplitBrain from "./components/SplitBrain";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";


const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '<PROJECT_NAME>',
  url: 'https://<DOMAIN>',
  description: '<DESCRIPTION>',
  image: 'https://<DOMAIN>/logo.png',
}


export default function Home() {
  return (
    <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Navbar/>
        <Hero/>
        <LogicFlow />
        <SplitBrain/>
        <Pricing/>
        <Footer/>
    </>
    
  );
}
