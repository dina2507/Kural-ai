import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { APP_CONFIG } from '@/lib/config';

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

function LiveIssueFeed() {
  const { data: issues, isLoading, error } = useQuery({
    queryKey: ['liveIssues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('id, title, category, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet, return empty
          return [];
        }
        throw error;
      }
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-8 text-center text-text-tertiary">
        Fetching live issues...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-8 text-center text-danger">
        Error loading issues. Please ensure the database schema is applied.
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-8 text-center text-text-tertiary">
        No active issues reported yet. Be the first to report!
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
      {issues.map((issue) => (
        <div key={issue.id} className="p-4 border-b border-border last:border-0 flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary">{issue.title}</p>
            <p className="text-sm text-text-secondary capitalize">{issue.category.replace('_', ' ')}</p>
          </div>
          <span className="text-xs text-text-tertiary">
            {new Date(issue.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  return (
    <motion.div 
      className="flex flex-col gap-12"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Hero Section */}
      <motion.section variants={fadeInUp} className="text-center py-12 md:py-24">
        <div className="w-32 h-32 mx-auto rounded-full border-4 border-primary/20 flex items-center justify-center mb-8 relative">
          {/* Placeholder for Pulse Ring */}
          <div className="w-24 h-24 bg-primary rounded-full opacity-20 absolute animate-pulse"></div>
          <span className="text-4xl font-black text-primary">K</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-text-primary tracking-tight mb-4">
          {APP_CONFIG.name}
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          {APP_CONFIG.tagline}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/report"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-medium rounded-lg shadow-primary hover:bg-primary-light transition-colors"
          >
            Report an Issue
          </Link>
          <Link 
            to="/map"
            className="w-full sm:w-auto px-8 py-4 bg-bg-surface text-text-primary font-medium rounded-lg border border-border hover:bg-bg-elevated transition-colors"
          >
            View Map
          </Link>
        </div>
      </motion.section>

      {/* Stats Bar */}
      <motion.section variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-surface p-6 rounded-xl border border-border text-center">
          <p className="text-sm font-medium text-text-secondary mb-2">Active Issues</p>
          <p className="text-4xl font-mono font-black text-text-primary">—</p>
        </div>
        <div className="bg-bg-surface p-6 rounded-xl border border-border text-center">
          <p className="text-sm font-medium text-text-secondary mb-2">Resolved This Week</p>
          <p className="text-4xl font-mono font-black text-success">—</p>
        </div>
        <div className="bg-bg-surface p-6 rounded-xl border border-border text-center">
          <p className="text-sm font-medium text-text-secondary mb-2">City Health Score</p>
          <p className="text-4xl font-mono font-black text-health-good">—</p>
        </div>
      </motion.section>

      {/* Live Issue Feed */}
      <motion.section variants={fadeInUp}>
        <h2 className="text-2xl font-semibold mb-6">Live Issue Feed</h2>
        <LiveIssueFeed />
      </motion.section>

      {/* CTA Section */}
      <motion.section variants={fadeInUp} className="text-center py-12 bg-primary-subtle rounded-2xl border border-primary/20">
        <h2 className="text-3xl font-bold text-text-primary mb-4">Join the movement</h2>
        <p className="text-text-secondary mb-8">Help your city identify and resolve critical infrastructure issues.</p>
        <Link 
          to="/auth"
          className="inline-block px-8 py-3 bg-white text-bg-base font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Sign In
        </Link>
      </motion.section>
    </motion.div>
  );
}
