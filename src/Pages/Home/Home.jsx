import Hero from "../../component/Hero/Hero";
import Features from "../../component/Home/Features";
import HowItWorks from "../../component/Home/HowItWorks";
import Stats from "../../component/Home/Stats";
import Testimonials from "../../component/Home/Testimonials";
import FAQ from "../../component/Home/FAQ";
import CTA from "../../component/Home/CTA";

const Home = () => {
  return (
    <div className="w-full">
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
};

export default Home;
