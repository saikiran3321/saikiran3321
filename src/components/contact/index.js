import React, { useEffect, useState } from "react";
import Layout from '@theme/Layout';

const contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(formData.subject || 'Contact from Portfolio Website');
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      const mailtoLink = `mailto:kiransaikiran057@gmail.com?subject=${subject}&body=${body}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Layout title="Contact" description="Get in touch with me">
        <main>
          <div className="container">
            <div className="text-container">
              <h3 style={{padding: "10px 0px", display:"flex", alignItems:"center"}} className="resume-link">
                <img src="/img/contact.svg" alt='Contact icon' width={25} height={25} style={{paddingRight: "5px"}}/> 
                Contact Me
              </h3>
              <h1 style={{whiteSpace:"normal"}}>
                <span className='highlight'>Let's Connect!</span><br/>
                I'd Love to Hear From You
              </h1>
              <p style={{whiteSpace:"normal", fontSize: "1.25rem", marginBottom: "40px"}}>
                Whether you have a project in mind, want to discuss opportunities, or just want to say hello, 
                I'm always excited to connect with fellow developers and potential collaborators.
              </p>

              {/* Contact Form */}
              <div style={{marginBottom: "60px"}}>
                <h2 style={{marginBottom: "30px", textAlign: "center"}}>Send Me a Message</h2>
                <div className="step-content" style={{padding: "40px", borderRadius: "15px", maxWidth: "800px", margin: "0 auto"}}>
                  <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "25px"}}>
                    {/* Name and Email Row */}
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                      <div style={{display: "flex", flexDirection: "column"}}>
                        <label htmlFor="name" style={{marginBottom: "8px", fontWeight: "600", fontSize: "1.1rem"}}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          style={{
                            padding: "15px",
                            border: "2px solid rgba(0, 119, 255, 0.3)",
                            borderRadius: "8px",
                            fontSize: "1rem",
                            backgroundColor: "transparent",
                            color: "inherit",
                            transition: "border-color 0.3s ease"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "rgba(0, 119, 255, 0.7)"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(0, 119, 255, 0.3)"}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div style={{display: "flex", flexDirection: "column"}}>
                        <label htmlFor="email" style={{marginBottom: "8px", fontWeight: "600", fontSize: "1.1rem"}}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          style={{
                            padding: "15px",
                            border: "2px solid rgba(0, 119, 255, 0.3)",
                            borderRadius: "8px",
                            fontSize: "1rem",
                            backgroundColor: "transparent",
                            color: "inherit",
                            transition: "border-color 0.3s ease"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "rgba(0, 119, 255, 0.7)"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(0, 119, 255, 0.3)"}
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div style={{display: "flex", flexDirection: "column"}}>
                      <label htmlFor="subject" style={{marginBottom: "8px", fontWeight: "600", fontSize: "1.1rem"}}>
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        style={{
                          padding: "15px",
                          border: "2px solid rgba(0, 119, 255, 0.3)",
                          borderRadius: "8px",
                          fontSize: "1rem",
                          backgroundColor: "transparent",
                          color: "inherit",
                          transition: "border-color 0.3s ease"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "rgba(0, 119, 255, 0.7)"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(0, 119, 255, 0.3)"}
                        placeholder="What's this about?"
                      />
                    </div>

                    {/* Message */}
                    <div style={{display: "flex", flexDirection: "column"}}>
                      <label htmlFor="message" style={{marginBottom: "8px", fontWeight: "600", fontSize: "1.1rem"}}>
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows="6"
                        style={{
                          padding: "15px",
                          border: "2px solid rgba(0, 119, 255, 0.3)",
                          borderRadius: "8px",
                          fontSize: "1rem",
                          backgroundColor: "transparent",
                          color: "inherit",
                          transition: "border-color 0.3s ease",
                          resize: "vertical",
                          fontFamily: "inherit"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "rgba(0, 119, 255, 0.7)"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(0, 119, 255, 0.3)"}
                        placeholder="Tell me about your project, question, or how I can help you..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div style={{display: "flex", justifyContent: "center", marginTop: "20px"}}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          padding: "15px 40px",
                          backgroundColor: "rgba(0, 119, 255, 0.7)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          cursor: isSubmitting ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          opacity: isSubmitting ? 0.7 : 1
                        }}
                        onMouseOver={(e) => {
                          if (!isSubmitting) {
                            e.target.style.backgroundColor = "rgba(0, 119, 255, 0.9)";
                            e.target.style.transform = "translateY(-2px)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSubmitting) {
                            e.target.style.backgroundColor = "rgba(0, 119, 255, 0.7)";
                            e.target.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        {isSubmitting ? "Sending..." : "Send Message 📧"}
                      </button>
                    </div>

                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                      <div style={{
                        padding: "15px",
                        backgroundColor: "rgba(76, 175, 80, 0.1)",
                        border: "2px solid rgba(76, 175, 80, 0.3)",
                        borderRadius: "8px",
                        color: "#4CAF50",
                        textAlign: "center",
                        fontSize: "1rem"
                      }}>
                        ✅ Your email client should open now. If not, please copy the message and send it manually to kiransaikiran057@gmail.com
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div style={{
                        padding: "15px",
                        backgroundColor: "rgba(244, 67, 54, 0.1)",
                        border: "2px solid rgba(244, 67, 54, 0.3)",
                        borderRadius: "8px",
                        color: "#f44336",
                        textAlign: "center",
                        fontSize: "1rem"
                      }}>
                        ❌ Something went wrong. Please try again or contact me directly at kiransaikiran057@gmail.com
                      </div>
                    )}
                  </form>

                  {/* Form Footer */}
                  <div style={{
                    marginTop: "30px",
                    padding: "20px",
                    backgroundColor: "rgba(0, 119, 255, 0.05)",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontSize: "0.95rem",
                    color: "var(--ifm-color-emphasis-600)"
                  }}>
                    <p style={{margin: "0 0 10px 0"}}>
                      🔒 Your information is secure and will only be used to respond to your inquiry.
                    </p>
                    <p style={{margin: 0}}>
                      For immediate assistance, feel free to call or WhatsApp me directly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Details Section */}
              <div style={{marginBottom: "40px"}}>
                <h2 style={{marginBottom: "30px", textAlign: "center"}}>My Contact Information</h2>
              </div>

              {/* Contact Information Cards */}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "40px"}}>
                
                {/* Personal Info Card */}
                <div className="step-content" style={{padding: "30px", borderRadius: "15px"}}>
                  <div className="title" style={{display: "flex", alignItems: "center", marginBottom: "20px"}}>
                    <img src="/img/about.svg" alt="person" width={30} height={30} className="icon-change" style={{marginRight: "10px"}}/>
                    Personal Information
                  </div>
                  <div style={{fontSize: "1.1rem", lineHeight: "1.8"}}>
                    <div style={{display: "flex", alignItems: "center", marginBottom: "15px"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Name:</strong>&nbsp;Sai Kiran Malladi
                    </div>
                    <div style={{display: "flex", alignItems: "center", marginBottom: "15px"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Role:</strong>&nbsp;Full Stack Developer
                    </div>
                    <div style={{display: "flex", alignItems: "center"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Location:</strong>&nbsp;India
                    </div>
                  </div>
                </div>

                {/* Contact Details Card */}
                <div className="step-content" style={{padding: "30px", borderRadius: "15px"}}>
                  <div className="title" style={{display: "flex", alignItems: "center", marginBottom: "20px"}}>
                    <img src="/img/contact.svg" alt="contact" width={30} height={30} className="icon-change" style={{marginRight: "10px"}}/>
                    Contact Details
                  </div>
                  <div style={{fontSize: "1.1rem", lineHeight: "1.8"}}>
                    <div style={{display: "flex", alignItems: "center", marginBottom: "15px"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Mobile:</strong>&nbsp;
                      <a href="tel:+917730066959" style={{color: "rgba(0, 119, 255, 0.7)", textDecoration: "none"}}>
                        +91 7730066959
                      </a>
                    </div>
                    <div style={{display: "flex", alignItems: "center"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Email:</strong>&nbsp;
                      <a href="mailto:kiransaikiran057@gmail.com" style={{color: "rgba(0, 119, 255, 0.7)", textDecoration: "none"}}>
                        kiransaikiran057@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact Actions */}
              <div style={{marginBottom: "40px"}}>
                <h2 style={{marginBottom: "20px", textAlign: "center"}}>Quick Contact</h2>
                <div style={{display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap"}}>
                  <a 
                    href="tel:+917730066959" 
                    style={{
                      display: "flex", 
                      alignItems: "center", 
                      padding: "15px 25px", 
                      backgroundColor: "rgba(0, 119, 255, 0.1)", 
                      border: "2px solid rgba(0, 119, 255, 0.7)", 
                      borderRadius: "10px", 
                      textDecoration: "none", 
                      color: "inherit",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.2)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.1)";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    📱 Call Me
                  </a>
                  <a 
                    href="mailto:kiransaikiran057@gmail.com" 
                    style={{
                      display: "flex", 
                      alignItems: "center", 
                      padding: "15px 25px", 
                      backgroundColor: "rgba(0, 119, 255, 0.1)", 
                      border: "2px solid rgba(0, 119, 255, 0.7)", 
                      borderRadius: "10px", 
                      textDecoration: "none", 
                      color: "inherit",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.2)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.1)";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    ✉️ Email Me
                  </a>
                  <a 
                    href="https://wa.me/917730066959" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", 
                      alignItems: "center", 
                      padding: "15px 25px", 
                      backgroundColor: "rgba(0, 119, 255, 0.1)", 
                      border: "2px solid rgba(0, 119, 255, 0.7)", 
                      borderRadius: "10px", 
                      textDecoration: "none", 
                      color: "inherit",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.2)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.1)";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>

              {/* Social Media Links */}
              <div style={{marginBottom: "40px"}}>
                <h2 style={{marginBottom: "20px", textAlign: "center"}}>Connect on Social Media</h2>
                <div className='inline-buttons' style={{justifyContent: "center"}}>
                  <a href='https://github.com/saikiran3321' target="_blank" rel="noopener noreferrer" alt="github">
                    <button className='icon-buttons'>
                      <img src='/img/github.svg' alt='github' />
                    </button>
                  </a>
                  <a href='https://codepen.io/kiransai' target="_blank" rel="noopener noreferrer" alt="codepen">
                    <button className='icon-buttons'>
                      <img src='/img/codepen.svg' alt='codepen' />
                    </button>
                  </a>
                  <a href='https://www.facebook.com/share/1KYFjFoPqv/' target="_blank" rel="noopener noreferrer" alt="facebook">
                    <button className='icon-buttons'>
                      <img src='/img/facebook.svg' alt='facebook' />
                    </button>
                  </a>
                  <a href='https://www.linkedin.com/in/sai-kiran-malladi' target="_blank" rel="noopener noreferrer" alt="LinkedIn">
                    <button className='icon-buttons'>
                      <img src='/img/linkined.svg' alt='LinkedIn' />
                    </button>
                  </a>
                </div>
              </div>

              {/* Availability Status */}
              <div className="step-content" style={{padding: "30px", borderRadius: "15px", textAlign: "center", marginBottom: "40px"}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px"}}>
                  <div style={{
                    width: "12px", 
                    height: "12px", 
                    backgroundColor: "#4CAF50", 
                    borderRadius: "50%", 
                    marginRight: "10px",
                    animation: "pulse 2s infinite"
                  }}></div>
                  <h3 style={{margin: 0, color: "#4CAF50"}}>Available for New Opportunities</h3>
                </div>
                <p style={{fontSize: "1.1rem", margin: 0}}>
                  I'm currently open to discussing new projects, collaborations, and full-time opportunities. 
                  Let's build something amazing together!
                </p>
              </div>

              {/* Response Time */}
              <div style={{textAlign: "center", fontSize: "1rem", color: "var(--ifm-color-emphasis-600)"}}>
                <p>📧 I typically respond to emails within 24 hours</p>
                <p>📱 For urgent matters, feel free to call or WhatsApp</p>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default contact;