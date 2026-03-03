import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
// import { Projects } from "./components/sections/Projects";
// import { Skills } from "./components/sections/Skills";
import { Timeline } from "./components/sections/Timeline";
// import { Experience } from "./components/sections/Experience";
// import { Education } from "./components/sections/Education";
import { SanchoDemo } from "./components/sections/SanchoDemo";
import { ChatHelpWidget } from "./components/ui/ChatHelpWidget";
import { Contact } from "./components/sections/Contact";

function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        {/* <Projects />
        <Skills /> */}
        <Timeline />
        {/* <Experience />
        <Education /> */}
        <SanchoDemo />
        <Contact />
      </main>
      <Footer />
      <ChatHelpWidget />
    </>
  );
}

export default App;
