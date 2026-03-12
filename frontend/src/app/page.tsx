"use client";

import Link from "next/link";
import { Sparkles, Image as ImageIcon, Zap, Lock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8">
                Create breathtaking art with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                  Artificial Intelligence
                </span>
              </h1>
              <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
                Transform your imagination into stunning visuals in seconds. Our advanced AI models understand your prompts to generate unique, high-quality images.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/generate"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-white transition-all bg-purple-600 rounded-full hover:bg-purple-700 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Generating
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold transition-all border rounded-full text-zinc-300 border-zinc-700 hover:bg-zinc-800"
                >
                  <ImageIcon className="w-5 h-5" />
                  Explore Gallery
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="p-4 bg-purple-500/10 rounded-2xl">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold">Lightning Fast</h3>
                <p className="text-zinc-400">Generate high-resolution images in seconds using state-of-the-art models.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="p-4 bg-pink-500/10 rounded-2xl">
                  <ImageIcon className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold">Stunning Quality</h3>
                <p className="text-zinc-400">Our AI uses Stable Diffusion to produce breathtaking, highly detailed artwork.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="p-4 bg-blue-500/10 rounded-2xl">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Private & Secure</h3>
                <p className="text-zinc-400">Your generated images and prompts are securely stored in your personal dashboard.</p>
              </motion.div>
            </div>
          </div>
        </section>
        {/* Inspiration Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold">Inspiration</h2>
              <p className="text-zinc-400 mt-2">Discover what others are creating with our AI</p>
            </div>
            
            <InspirationGallery />
          </div>
        </section>
      </main>
      
      <footer className="border-t border-zinc-800 py-12 text-center text-zinc-500">
        <p>© 2026 AI ArtGen. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Client component for fetching and displaying the gallery
import { useState, useEffect } from "react";

function InspirationGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    import("@/lib/api").then(({ api }) => {
      // Fetch gallery
      api.get("/gallery?limit=8")
        .then((res) => setImages(res.data))
        .catch((err) => console.error("Gallery failed to load", err))
        .finally(() => setLoading(false));
        
      // Fetch user profile to check for admin
      const token = localStorage.getItem("token");
      if (token) {
        api.get("/user/me")
          .then((res) => setUser(res.data))
          .catch(() => console.error("Not logged in"));
      }
    });
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    import("@/lib/api").then(async ({ api }) => {
      try {
        await api.delete(`/gallery/${id}`);
        setImages(images.filter((img) => img.id !== id));
      } catch (error) {
        console.error("Failed to delete image:", error);
        alert("Failed to delete image");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500 rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800">
        No images available yet. Be the first to generate!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((img, i) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="group relative rounded-xl overflow-hidden bg-zinc-900 aspect-square"
        >
          <img
            src={`http://localhost:8000${img.image_url}`}
            alt={img.prompt || "AI Artwork"}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <p className="text-sm font-medium text-white line-clamp-2 mb-2">{img.prompt}</p>
            {user?.is_admin && (
              <div className="flex justify-end">
                <button 
                  onClick={() => handleDelete(img.id)}
                  className="p-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-lg text-white transition-colors"
                  title="Delete Image (Admin)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
