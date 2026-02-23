import React from 'react';
import { motion } from 'framer-motion';

const companies = [
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 
  'Spotify', 'Airbnb', 'Uber', 'Slack', 'Zoom', 'Salesforce'
];

export default function TrustedSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 font-medium mb-10"
        >
          Trusted by some MNC companies
        </motion.p>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll gap-16">
            {[...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="flex-shrink-0 h-12 px-8 flex items-center justify-center bg-white rounded-lg shadow-sm"
              >
                <span className="text-xl font-bold text-gray-400 tracking-wide">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
