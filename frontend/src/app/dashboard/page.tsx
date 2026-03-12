"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2, LayoutGrid, BarChart3, Download, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ImageRecord {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
  is_public: boolean;
}

interface Stats {
  total_generations: number;
  // Further metrics can be added
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [imagesRes, statsRes] = await Promise.all([
          api.get("/images/me"),
          api.get("/images/stats")
        ]);
        setImages(imagesRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
          <p className="text-zinc-400">Manage your creations and view your statistics.</p>
        </div>
        
        {stats && (
          <div className="flex gap-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Generations</p>
                <p className="text-2xl font-bold">{stats.total_generations}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
        <LayoutGrid className="w-5 h-5 text-zinc-400" />
        <h2 className="text-xl font-semibold">Your Generations</h2>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
          <p className="text-zinc-500 mb-4">You haven&apos;t generated any images yet.</p>
          <button
            onClick={() => router.push("/generate")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Your First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              <div className="aspect-square relative">
                <img
                  src={`http://localhost:8000${img.image_url}`}
                  alt={img.prompt}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs font-medium text-zinc-300 line-clamp-2 mb-3">
                      {img.prompt}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        {new Date(img.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors" title="Toggle Public/Private">
                          <Share2 className={`w-4 h-4 ${img.is_public ? 'text-green-400' : 'text-zinc-400'}`} />
                        </button>
                        <a
                          href={`http://localhost:8000${img.image_url}`}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
