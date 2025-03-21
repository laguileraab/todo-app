import React, { useState } from 'react';
import { cn } from '../utils/cn';
import Changelog from './Changelog';

interface LandingPageProps {
  setActivePage: (page: string) => void;
  activePage: string;
}

// Hero section
const Hero = ({ setActivePage }: { setActivePage: (page: string) => void }) => {
  return (
    <section className="min-h-screen flex flex-col justify-center px-4 md:px-8 pt-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Organize Your <span className="text-primary-600 dark:text-primary-400">Tasks</span> Like Never Before
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
              Todo Master helps you organize tasks, boost productivity, and collaborate with your team — all in one place.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setActivePage('signup')}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-300"
              >
                Get Started
              </button>
              <button 
                onClick={() => setActivePage('features')}
                className="px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 font-medium rounded-lg transition-colors duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl opacity-80 shadow-2xl"></div>
              <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl transform -rotate-3 opacity-80 flex items-center justify-center">
                <div className="w-full max-w-sm p-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Todo Master</h3>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center">
                        <span className="h-5 w-5 mr-2 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <svg className="h-3 w-3 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">Task Item {item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features section
const Features = () => {
  const features = [
    {
      title: "Real-time Syncing",
      description: "Your tasks sync instantly across all your devices, keeping you up to date wherever you are.",
      icon: (
        <svg className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      title: "Customizable Workflows",
      description: "Create workflows that fit your needs with customizable tags, priorities, and categories.",
      icon: (
        <svg className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: "Drag & Drop Organization",
      description: "Effortlessly organize and prioritize your tasks with intuitive drag and drop functionality.",
      icon: (
        <svg className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )
    },
    {
      title: "Smart Reminders",
      description: "Never miss a deadline with customizable reminders and notifications for upcoming tasks.",
      icon: (
        <svg className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    }
  ];

  return (
    <section id="features" className="py-16 px-4 md:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Powerful Features for Your Todo List
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Todo Master comes packed with all the tools you need to manage your tasks efficiently.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md transition-transform duration-300 hover:transform hover:scale-105"
            >
              <div className="mb-4 text-primary-600 dark:text-primary-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing section
const Pricing = ({ setActivePage }: { setActivePage: (page: string) => void }) => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Up to 10 active tasks",
        "Basic task management",
        "Email reminders",
        "1 collaborator"
      ],
      cta: "Get Started",
      featured: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "For power users and small teams",
      features: [
        "Unlimited tasks",
        "Advanced task organization",
        "Priority support",
        "Up to 5 collaborators",
        "Custom task templates",
        "Advanced analytics"
      ],
      cta: "Get Pro",
      featured: true
    },
    {
      name: "Team",
      price: "$19.99",
      period: "per month",
      description: "For growing teams and businesses",
      features: [
        "Everything in Pro",
        "Unlimited collaborators",
        "Team dashboards",
        "Admin controls",
        "Advanced permissions",
        "24/7 priority support"
      ],
      cta: "Get Team",
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Plans for Teams of All Sizes
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose a plan that fits your needs. All plans include our core features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={cn(
                "rounded-lg overflow-hidden transition-all duration-300",
                plan.featured 
                  ? "bg-primary-600 text-white transform scale-105 shadow-xl" 
                  : "bg-white dark:bg-gray-700 shadow-md hover:shadow-lg"
              )}
            >
              {plan.featured && (
                <div className="bg-primary-700 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className={cn(
                  "text-2xl font-bold mb-2",
                  plan.featured ? "text-white" : "text-gray-900 dark:text-white"
                )}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className={cn(
                      "text-sm ml-1",
                      plan.featured ? "text-white/80" : "text-gray-500 dark:text-gray-300"
                    )}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "mb-6",
                  plan.featured ? "text-white/80" : "text-gray-500 dark:text-gray-300"
                )}>
                  {plan.description}
                </p>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg 
                        className={cn(
                          "h-5 w-5 mr-2",
                          plan.featured ? "text-white" : "text-primary-600 dark:text-primary-400"
                        )} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <span className={cn(
                        plan.featured ? "text-white/90" : "text-gray-600 dark:text-gray-300"
                      )}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => setActivePage('signup')}
                  className={cn(
                    "w-full py-3 rounded-lg font-medium transition-colors duration-300",
                    plan.featured 
                      ? "bg-black text-white hover:bg-gray-800 border-2 border-white" 
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// About Us section
const AboutUs = () => {
  const team = [
    {
      name: "Alex Morgan",
      role: "Founder & CEO",
      bio: "Alex founded Todo Master with a vision to help people stay organized and productive.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Sarah Johnson",
      role: "Lead Developer",
      bio: "Sarah leads our development team and has architected our real-time syncing feature.",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "David Chen",
      role: "UX Designer",
      bio: "David ensures that Todo Master is intuitive and accessible for all users.",
      image: "https://randomuser.me/api/portraits/men/22.jpg"
    }
  ];

  return (
    <section id="about" className="py-16 px-4 md:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We're a passionate team dedicated to making task management better for everyone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {team.map((member, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md"
            >
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Our Story
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Todo Master was born from a simple idea: task management should be simple, intuitive, and actually help you be more productive. We were tired of complex project management tools that required hours of setup and training.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We started building Todo Master in 2020, working closely with early users to refine the experience. What began as a simple todo list has evolved into a powerful productivity platform used by thousands of individuals and teams worldwide.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Our mission is to help you focus on what matters most by making task management effortless. We're constantly improving and adding new features based on your feedback.
          </p>
        </div>
      </div>
    </section>
  );
};

// Footer component
interface FooterProps {
  onShowChangelog: () => void;
}

const Footer = ({ onShowChangelog }: FooterProps) => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Todo Master</h3>
            <p className="mb-4">
              The simple yet powerful todo app that helps you stay organized and productive.
            </p>
          </div>
          
          <div>
            <h4 className="text-white text-md font-medium mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-primary-400 transition-colors">Task Management</a></li>
              <li><a href="#features" className="hover:text-primary-400 transition-colors">Collaboration</a></li>
              <li><a href="#features" className="hover:text-primary-400 transition-colors">Reminders</a></li>
              <li><a href="#features" className="hover:text-primary-400 transition-colors">Analytics</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-md font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-md font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a></li>
              <li>
                <button 
                  onClick={onShowChangelog}
                  className="hover:text-primary-400 transition-colors text-left"
                >
                  Release Notes
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Todo Master. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const LandingPage = ({ setActivePage, activePage }: LandingPageProps) => {
  const [showChangelog, setShowChangelog] = useState(false);
  
  // Based on activePage, we'll scroll to the appropriate section
  React.useEffect(() => {
    if (activePage === 'features') {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    } else if (activePage === 'pricing') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    } else if (activePage === 'about') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activePage]);

  // Prevent body scroll when changelog is open
  React.useEffect(() => {
    if (showChangelog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showChangelog]);

  const handleShowChangelog = () => {
    setShowChangelog(true);
  };
  
  const handleCloseChangelog = () => {
    setShowChangelog(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Hero setActivePage={setActivePage} />
      <Features />
      <Pricing setActivePage={setActivePage} />
      <AboutUs />
      <Footer onShowChangelog={handleShowChangelog} />
      
      {/* Changelog Modal */}
      <Changelog onClose={handleCloseChangelog} isOpen={showChangelog} />
    </div>
  );
};

export default LandingPage; 