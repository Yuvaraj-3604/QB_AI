import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Video, 
  Laptop, 
  Radio,
  CalendarDays,
  BadgeCheck,
  Smartphone,
  Mail,
  BarChart3,
  Globe
} from 'lucide-react';

const eventTypes = [
  {
    title: 'In-Person Events',
    description: 'Power your in-person events with badge printing, mobile app, event registration. Enjoy smooth entry with our NFC tech.',
    icon: Users,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Virtual Events',
    description: 'Deploy engaging and customizable virtual experiences at scale. Drive engagement and generate powerful insights.',
    icon: Video,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Hybrid Events',
    description: 'Bring your sessions, networking, and sponsors to your Virtual Lobby! Create unique experiences for all attendees.',
    icon: Laptop,
    color: 'bg-cyan-500',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Webinars',
    description: 'Communicate, present and inspire with a flexible premium video platform. All-in-one with registration and tracking.',
    icon: Radio,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600'
  }
];

const features = [
  { icon: CalendarDays, title: 'Event Registration', desc: 'Smart branded forms' },
  { icon: BadgeCheck, title: 'Badge Printing', desc: 'On-site credentials' },
  { icon: Smartphone, title: 'Mobile App', desc: 'Keep everyone connected' },
  { icon: Mail, title: 'Event Marketing', desc: 'Targeted campaigns' },
  { icon: BarChart3, title: 'Analytics', desc: 'Powerful insights' },
  { icon: Globe, title: 'Virtual Lobby', desc: 'Immersive experience' }
];

export default function FeaturesSection() {
  return (
    <section id="solutions" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">Solutions</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-4 mb-6">
            The most flexible event management software
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From intimate gatherings to large-scale conferences, our platform adapts to your unique needs.
          </p>
        </motion.div>

        {/* Event Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {eventTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <type.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{type.title}</h3>
              <p className="text-gray-600 leading-relaxed">{type.description}</p>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${type.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="features"
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            A comprehensive feature set for you
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500 transition-colors">
                  <feature.icon className="w-8 h-8 text-cyan-400 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
