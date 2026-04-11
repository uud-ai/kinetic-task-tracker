import React from 'react';
import { Calendar as CalendarIcon, AlertCircle, Tag, PlusCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function CreateTask() {
  const [priority, setPriority] = React.useState('Medium');
  const [tags, setTags] = React.useState(['design', 'studio']);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-12"
    >
      <header>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Architectural Curator</span>
        <h2 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight leading-none mb-6">Create New Task</h2>
        <p className="text-on-surface-variant text-lg max-w-md">Transform your ideas into structured action within your digital studio.</p>
      </header>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Task Title</label>
          <input 
            className="w-full bg-surface-container-low border-none rounded-xl px-6 py-5 text-xl font-headline font-semibold placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all" 
            placeholder="What needs to be done?" 
            type="text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <CalendarIcon size={18} />
              <label className="text-[10px] font-bold uppercase tracking-wider">Due Date</label>
            </div>
            <input 
              className="w-full bg-transparent border-none p-0 text-on-surface font-medium focus:ring-0" 
              type="date" 
            />
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <AlertCircle size={18} />
              <label className="text-[10px] font-bold uppercase tracking-wider">Priority Level</label>
            </div>
            <div className="flex gap-2">
              {['High', 'Medium', 'Low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all",
                    priority === p 
                      ? "bg-primary text-on-primary" 
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-low"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Context & Details</label>
          <textarea 
            className="w-full bg-surface-container-low border-none rounded-xl px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all resize-none" 
            placeholder="Add some architectural depth to this task..." 
            rows={4}
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                #{tag} 
                <button onClick={() => setTags(tags.filter(t => t !== tag))}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <button className="px-4 py-1.5 rounded-full border border-dashed border-outline-variant text-outline text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-container-low transition-colors">
              <PlusCircle size={12} /> Add Tag
            </button>
          </div>
        </div>

        <div className="relative h-32 rounded-xl overflow-hidden bg-surface-container-highest group">
          <img 
            src="https://picsum.photos/seed/aesthetic/800/200" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay" 
            alt="Decoration"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary">Workspace Aesthetic</p>
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 text-lg flex items-center justify-center gap-3">
          <PlusCircle size={24} />
          Create Task
        </button>
      </form>
    </motion.div>
  );
}
