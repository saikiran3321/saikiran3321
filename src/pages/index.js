import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { useParams } from "react-router-dom";

import Heading from '@theme/Heading';
import TextAnimation from "@site/src/components/TextAnimation";

import About from "@site/src/components/about";
import Contact from "@site/src/components/contact";
import Projects from "@site/src/components/projects";
import Skills from "@site/src/components/skills";


function HomepageHeader() {
  return (
    <header className="animation-container">
      <div className="container">
        <div className='main-container'>
          <div className="left-container">
            <>
              <Heading as="h1" className="hero__title">
                Hi! <img src="/img/hand.webp" alt='Hand icon' width={40} height={55}/>
              </Heading>
              <p className="hero__subtitle">Welcome to my portfolio</p>
              <TextAnimation />
              <p className='hero__subtitle'>I'm a Software Engineer specializing in <span className='highlight'>Full-Stack Web Development</span> and <span className='highlight'>Cloud Architecture</span>. I'm passionate about crafting elegant solutions to complex problems.</p>
              <p>I'm always eager to expand my skill set and stay up-to-date with the latest technology trends.</p>
              <p>"With small steps, I will go very far."</p>
              <div className='inline-buttons'>
                <a href='https://github.com/saikiran3321' alt="github" ><button className='icon-buttons'><img src='/img/github.svg' alt='github' /></button></a>
                <a href='https://codepen.io/kiransai' alt="codepen" ><button className='icon-buttons'><img src='/img/codepen.svg' alt='codepen' /></button></a>
                <a href='https://www.facebook.com/share/1KYFjFoPqv/' alt="facebook" ><button className='icon-buttons'><img src='/img/facebook.svg' alt='facebook' /></button></a>
                <a href='https://www.linkedin.com/in/sai-kiran-malladi' alt="Linkined" ><button className='icon-buttons'><img src='/img/linkined.svg' alt='Linkined' /></button></a>
                <a href='mailto:kiransaikiran057@gmail.com' alt="mail" ><button className='icon-buttons'><img src='/img/mail.svg' alt='mail' /></button></a>
                <a href='/assets/docs/Sai kiran Malladi.pdf' alt="resum link" className='resume-link' style={{display:"flex",alignItems: 'center',border: "2px solid rgba(0, 119, 255, 0.7)",borderRadius: "10px",padding: "0px 10px",textDecoration: 'none',color:"inherit"}}><img src='/img/download.svg' alt="download" style={{padding: "10px"}}/>Download Resume</a>
              </div>
            </>
          </div>
          <div className="right-container">
            {/* <img src='/img/coading.gif' alt='coder'/> */}
            <img src='/img/coder.webp' alt='coder' />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const { page } = useParams();

  const renderPage = () => {
    switch (page) {
      case "about":
        return <About />;
      case "projects":
        return <Projects />;
      case "skills":
        return <Skills />;
      case "contact":
        return <Contact />;
      default:
        return <HomepageHeader />;
    }
  };

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <main>
        {renderPage()}
      </main>
    </Layout>
  );
}
