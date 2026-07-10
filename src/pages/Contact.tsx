import React, { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import { Mail, Phone, MapPin, Send, ShieldCheck, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [category, setCategory] = useState<string>('feedback');
  const [message, setMessage] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to local storage for test verification
    const contacts = JSON.parse(localStorage.getItem('fifa_contact_queries') || '[]');
    contacts.push({
      id: Date.now(),
      name,
      email,
      category,
      message,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('fifa_contact_queries', JSON.stringify(contacts));

    setSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSuccess(false), 3000);
  };

  const contactsList = [
    { title: 'Operations Control Center', detail: '+1 (800) 2026-OPS', icon: Phone },
    { title: 'Spectator Support Email', detail: 'support@fifaverse.google.com', icon: Mail },
    { title: 'Central Stadium Command Post', detail: 'Sector 2 concourse, Los Angeles Stadium', icon: MapPin },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-fifa-teal text-sm font-bold uppercase tracking-wider">
          <Mail className="h-4 w-4" />
          <span>Contact Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Get in Touch</h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Contact the technical team or submit feedback regarding stadium operations and AI features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Form */}
        <div className="lg:col-span-7">
          <GlassCard glowColor="teal" className="space-y-4">
            <h2 className="text-lg font-bold text-white">Submit Support Ticket</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-teal"
                    placeholder="Ayush Kumar"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-teal"
                    placeholder="ayush@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Feedback Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-teal cursor-pointer"
                >
                  <option value="feedback">General Platform Feedback</option>
                  <option value="navigation_issue">Stadium Navigation Glitch</option>
                  <option value="volunteer_inquiry">Volunteer Portal Issues</option>
                  <option value="accessibility_suggestion">Accessibility Suggestion</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Message Content</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl bg-fifa-purple border border-white/10 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-fifa-teal resize-none"
                  placeholder="Tell us what we can improve..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-fifa-blue to-fifa-teal text-white font-bold hover:shadow-neon-teal/20 transition-all text-xs uppercase flex items-center justify-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                Submit Ticket
              </button>
            </form>
          </GlassCard>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-4 rounded-xl bg-fifa-green/10 border border-fifa-green text-fifa-green font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-5 w-5 animate-bounce" />
                <span>Ticket submitted successfully! A support engineer will email you shortly.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Contact info */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard hoverEffect={false} className="border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white">Operations Hotlines</h2>
            <div className="space-y-4">
              {contactsList.map((contact, idx) => {
                const Icon = contact.icon;
                return (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-300">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{contact.title}</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">{contact.detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-2">
              <HeartHandshake className="h-5 w-5 text-fifa-teal mt-0.5 shrink-0" />
              <div className="text-[10px] text-slate-400 leading-normal">
                <span className="font-bold text-white block mb-0.5">Spectator Code of Conduct</span>
                Please comply with all security requests. Vandalism, physical fights, or fire tampering triggers automatic security logs and law enforcement dispatch.
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Contact;
