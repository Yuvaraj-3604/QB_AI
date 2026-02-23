import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const stats = [
  { value: '10', label: 'Events Created' },
  { value: '50', label: 'Registrations' }
];

const eventTypes = ['In-Person Events', 'Virtual Events', 'Conferences', 'Webinars', 'Hybrid Events'];

export default function HeroSection() {
  const [currentType, setCurrentType] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentType((prev) => (prev + 1) % eventTypes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <span className="text-white font-bold text-2xl">Questbridge</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="#solutions" className="text-gray-300 hover:text-white transition-colors">Solutions</a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="text-white hover:text-cyan-400 hover:bg-white/10">
              Dashboard
            </Button>
          </Link>
          <Link to="/login">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Event Management
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold text-cyan-400 mb-6">
            Software for
          </h2>

          <motion.div
            key={currentType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-16 flex items-center justify-center"
          >
            <span className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide">
              {eventTypes[currentType]}
            </span>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 max-w-xl mx-auto">
            <Input
              placeholder="Enter your work email"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-14 text-lg flex-1"
            />
            <Link to="/book-demo">
              <Button className="bg-cyan-500 hover:bg-cyan-600 h-14 px-8 text-lg">
                Book a Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-12 md:gap-24 mt-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-400">{stat.value}</div>
              <div className="text-gray-400 mt-2">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
