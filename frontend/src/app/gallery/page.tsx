"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Heart, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface ImageRecord {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
  user_id: number;
  is_public: boolean;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data } = await api.get("/gallery?limit=50");
        setImages(data);
      } catch (error) {
        console.error("Failed to load gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Check if user is logged in to check for admin status
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const { data } = await api.get("/user/me");
          setUser(data);
        }
      } catch (error) {
        console.error("Not logged in");
      }
    };

    fetchGallery();
    fetchUser();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      await api.delete(`/gallery/${id}`);
      setImages(images.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert("Failed to delete image");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Community Gallery</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Explore stunning AI-generated artwork created by our community.
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          No public images currently available in the gallery.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 break-inside-avoid mb-6 inline-block w-full shadow-lg"
            >
              <div className="relative w-full h-auto">
                <img
                  src={`http://localhost:8000${img.image_url}`}
                  alt={img.prompt}
                  className="object-cover w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  <p className="text-sm font-medium text-white line-clamp-3 mb-4 drop-shadow-md">
                    {img.prompt}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex gap-2">
                      <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/5 shadow-sm">
                        <Heart className="w-4 h-4" />
                      </button>
                      {(user?.is_admin || user?.id === img.user_id) && (
                        <button 
                          onClick={() => handleDelete(img.id)}
                          className="p-2.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-full text-white transition-colors shadow-sm"
                          title="Delete Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <a
                      href={`http://localhost:8000${img.image_url}`}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/5 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                    </a>
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
