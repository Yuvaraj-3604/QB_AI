import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-cyan-600 via-cyan-700 to-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-white text-sm font-medium">Powered by AI</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to transform your events?
          </h2>
          <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
            Join thousands of event professionals who trust our platform to deliver exceptional experiences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button size="lg" className="bg-white text-cyan-700 hover:bg-gray-100 h-14 px-8 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/book-demo">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg">
                Book a Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
