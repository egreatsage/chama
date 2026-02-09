'use client'
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Shield, Smartphone, Menu, X, ArrowRight, CheckCircle, Clock, FileText, Bell, PieChart } from 'lucide-react';

export default function ChamaHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Users className="w-12 h-12 text-red-600" />,
      title: "Member Management",
      description: "Keep track of all your chama members, their contributions, and participation history in one place."
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-green-600" />,
      title: "Investment Tracking",
      description: "Monitor your group investments, returns, and growth with real-time analytics and reports."
    },
    {
      icon: <Shield className="w-12 h-12 text-blue-600" />,
      title: "Secure & Reliable",
      description: "Bank-grade security ensures your money and data are protected with encryption and compliance."
    },
    {
      icon: <FileText className="w-12 h-12 text-red-600" />,
      title: "Financial Reports",
      description: "Generate detailed financial statements, balance sheets, and contribution records instantly."
    },
    {
      icon: <Bell className="w-12 h-12 text-green-600" />,
      title: "Smart Reminders",
      description: "Automated SMS and email reminders for contributions, meetings, and important deadlines."
    },
    {
      icon: <PieChart className="w-12 h-12 text-blue-600" />,
      title: "Loan Management",
      description: "Process, approve, and track member loans with automated interest calculations and schedules."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Register Your Chama",
      description: "Create your chama profile with member details and set your contribution schedule.",
      color: "red"
    },
    {
      step: "2",
      title: "Add Members",
      description: "Invite members via SMS or email. They can join and set up their profiles instantly.",
      color: "green"
    },
    {
      step: "3",
      title: "Track Contributions",
      description: "Members make contributions through M-Pesa. All transactions are tracked automatically.",
      color: "blue"
    },
    {
      step: "4",
      title: "Grow Together",
      description: "Make investments, process loans, and build wealth as a community.",
      color: "red"
    }
  ];

  const testimonials = [
    {
      name: "Jane Wanjiru",
      role: "Chairlady, Tumaini Chama",
      location: "Nairobi",
      content: "Since we started using this platform, our chama has grown from 12 to 45 members. The transparency it provides has built incredible trust.",
      
      image: "/personone.jpg"
    },
    {
      name: "David Omondi",
      role: "Treasurer, Bidii Investment Group",
      location: "Kisumu",
      content: "Managing loans used to be a nightmare. Now everything is automated - from applications to repayment tracking. Fantastic!",
      image: "/person3.webp"
    },
    {
      name: "Mary Akinyi",
      role: "Secretary, Harambee Women Group",
      location: "Mombasa",
      content: "The mobile app makes it so easy for our members to contribute anytime. Our collection rate went from 70% to 98%!",
      image: "persontwo.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
   

      {/* Hero Section */}
      <section className="pt-2 pb-16 bg-gradient-to-br from-red-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🇰🇪 Trusted by 5,000+ Chamas Across Kenya
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Build Wealth{' '}
                <span className="bg-gradient-to-r from-red-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
                  Together
                </span>
                {' '}With Your Chama
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The complete platform for managing contributions, tracking investments, processing loans, 
                and growing your chama's wealth. Simple, secure, and built for Kenyan communities.
              </p>
              
             
            </div>

            {/* Hero Image - Replace with your own */}
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Replace this src with your own image */}
                <img 
                  src="/chamaimage.webp" 
                  alt="Chama members meeting"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="bg-white rounded-lg p-4 inline-block">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">KES 2.5M</p>
                        <p className="text-sm text-gray-600">Contributed This Month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-gradient-to-br from-red-400 to-blue-400 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-br from-green-400 to-red-400 rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 via-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">5,000+</div>
              <div className="text-white/90">Active Chamas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">KES 1.2B</div>
              <div className="text-white/90">Total Savings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50,000+</div>
              <div className="text-white/90">Happy Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
              <div className="text-white/90">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Chama Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From member management to loan processing, we've got you covered with powerful tools 
              designed specifically for Kenyan chamas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition-all group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Section with Benefits - Replace images */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              {/* Replace these image sources with your own */}
              <img 
                src="/imageone.webp" 
                alt="Chama meeting"
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
              <img 
                src="/imagetwo.jpg" 
                alt="Group discussion"
                className="rounded-2xl shadow-lg w-full h-64 object-cover mt-8"
              />
              <img 
                src="/imagethree.jpg" 
                alt="Financial planning"
                className="rounded-2xl shadow-lg w-full h-64 object-cover -mt-8"
              />
              <img 
                src="/imagefour.jpg" 
                alt="Team celebration"
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built For Kenyan Communities
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We understand how chamas work in Kenya. Our platform is designed with your needs in mind, 
                supporting M-Pesa integration, Swahili language, and features that match how you already operate.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: "🇰🇪", text: "M-Pesa integration for instant contributions" },
                  { icon: "🏦", text: "Compliant with Kenyan financial regulations" },
                  { icon: "👥", text: "Supports merry-go-rounds, table banking & more" },
                  { icon: "💰", text: "Transparent loan tracking and interest calculations" },
                  { icon: "📊", text: "Easy-to-understand reports for all members" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700 text-lg">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Set up your chama in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => {
              const colorClasses = {
                red: 'bg-red-100 text-red-600 border-red-200',
                green: 'bg-green-100 text-green-600 border-green-200',
                blue: 'bg-blue-100 text-blue-600 border-blue-200'
              };

              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 rounded-full ${colorClasses[step.color]} border-4 flex items-center justify-center text-2xl font-bold mx-auto mb-4`}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute right-0 top-8 w-full">
                      <ArrowRight className="w-6 h-6 text-gray-300 mx-auto" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-red-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories from Kenyan Chamas
            </h2>
            <p className="text-xl text-gray-600">
              See how communities across Kenya are transforming their financial futures
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-green-100"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="mt-6 flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

   

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 via-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Chama?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 5,000+ chamas already building wealth together. Start your free 30-day trial today.
          </p>
       
          <p className="mt-6 text-white/80 text-sm">
            No credit card required • Cancel anytime • Full support included
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="ml-2 text-xl font-bold text-white">Chama Us</span>
              </div>
              <p className="text-sm text-gray-400">
                Empowering Kenyan communities to build wealth together through smart chama management.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-green-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-green-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Mobile App</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Press Kit</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2025 ChamaHub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm hover:text-green-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm hover:text-green-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-sm hover:text-green-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}