"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Sparkles, Loader2, Download, Image as ImageIcon, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GeneratePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("General");
  const [imageCount, setImageCount] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setError("");
    setLoading(true);
    setImageLoading(true);
    setGeneratedImageUrl(null);
    setRetryCount(0);

    try {
      // Send the requested style and aspect ratio
      const response = await api.post("/generate/", { prompt, style, aspect_ratio: aspectRatio });
      const imageUrl = response.data.image_url;
      const fullImageUrl = imageUrl.startsWith("http") ? imageUrl : `http://localhost:8000${imageUrl}`;
      
      setGeneratedImageUrl(fullImageUrl);
    } catch (err: any) {
      console.error("Backend generation error:", err);
      setError(
        err?.response?.data?.detail
          ? (typeof err.response.data.detail === "string" ? err.response.data.detail : JSON.stringify(err.response.data.detail))
          : "Failed to generate image. Please try again."
      );
      setImageLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    handleGenerate();
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-black text-zinc-300 font-sans">
      
      {/* Top Toggle Nav */}
      <div className="flex items-center justify-center space-x-2 bg-[#1C1C1E] p-1.5 rounded-full w-max mx-auto mb-8 border border-zinc-800">
        <button className="px-6 py-2 rounded-full bg-[#131314] text-white text-sm font-medium border border-zinc-700/50 shadow-sm cursor-default">
          Create Image
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        
        {/* Left Column - Input Section */}
        <div className="flex flex-col space-y-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            
            {/* Prompt Card */}
            <div className="bg-[#1C1C1E] border border-zinc-800/80 rounded-[20px] p-5 shadow-sm">
              <label className="text-sm font-semibold text-zinc-100 block mb-3">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={1000}
                placeholder="Describe the image you want to create..."
                className="w-full h-32 px-4 py-3 bg-[#131314] border border-zinc-800/80 rounded-xl focus:ring-1 focus:ring-zinc-600 focus:border-transparent resize-none text-white placeholder-zinc-500 transition-all text-sm shadow-inner"
                required
              />
              <div className="text-left text-xs text-zinc-500 mt-2 font-mono">
                {prompt.length} / 1000
              </div>
            </div>

            {/* Options Card */}
            <div className="bg-[#1C1C1E] border border-zinc-800/80 rounded-[20px] p-5 space-y-7 shadow-sm">
              
              {/* Model */}
              <div>
                <label className="text-sm font-semibold text-zinc-100 block mb-3">Model</label>
                <div className="flex items-center justify-between bg-[#23232A] border border-zinc-700/50 rounded-xl p-3 cursor-pointer hover:border-zinc-600 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center overflow-hidden border border-zinc-700">
                      {/* Using a placeholder SVG or just a colorful box for Model icon */}
                      <Sparkles className="w-5 h-5 text-white/80" />
                    </div>
                    <span className="text-sm font-medium text-white">Flux1.S</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-zinc-300">
                    <div className="w-3 h-3 bg-indigo-500 rounded-sm rotate-45 opacity-80" />
                    <span className="text-xs font-semibold">3</span>
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Image Count */}
              <div>
                <label className="text-sm font-semibold text-zinc-100 block mb-3">Image Count</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setImageCount(num)}
                      className={`py-2 rounded-[10px] text-[13px] font-medium transition-all ${
                        imageCount === num
                          ? "bg-gradient-to-r from-teal-400 to-indigo-500 text-white shadow-md border border-transparent"
                          : "bg-black/40 text-zinc-400 border border-zinc-800/80 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="text-sm font-semibold text-zinc-100 block mb-3">Style</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {["General", "Anime", "Enhance", "Fantasy Art", "Line Art", "Photograph", "Comic Book", "Digital Art"].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`py-2 rounded-[10px] text-[12px] font-medium transition-all ${
                        style === s
                          ? "bg-gradient-to-r from-teal-400 to-indigo-500 text-white shadow-md border border-transparent"
                          : "bg-black/40 text-zinc-400 border border-zinc-800/80 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="text-sm font-semibold text-zinc-100 block mb-3">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {["1:1", "2:3", "3:2", "4:5", "5:4", "9:16", "16:9", "TikTok"].map(ar => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => setAspectRatio(ar)}
                      className={`py-2 rounded-[10px] text-[12px] font-medium transition-all ${
                        aspectRatio === ar
                          ? "bg-gradient-to-r from-teal-400 to-indigo-500 text-white shadow-md border border-transparent"
                          : "bg-black/40 text-zinc-400 border border-zinc-800/80 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

            </div>

             <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-8 text-sm font-semibold text-white bg-zinc-100 rounded-[14px] text-zinc-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg select-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-zinc-900 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-zinc-900" />
                    Generate Image
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between gap-3">
                <span>{error}</span>
                {generatedImageUrl && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex items-center gap-1 text-red-300 hover:text-red-200 whitespace-nowrap"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Right Column - Output Section */}
        <div className="flex flex-col h-[calc(100vh-140px)] sticky top-6">
          <div className="bg-[#1C1C1E] border border-zinc-800/80 rounded-[20px] flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden group shadow-sm">
            {generatedImageUrl ? (
              <div className="w-full h-full relative flex flex-col items-center justify-center">
                
                {imageLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-400 z-10 bg-[#1C1C1E]/90 rounded-2xl backdrop-blur-sm">
                     <Loader2 className="w-12 h-12 text-zinc-500 animate-spin" />
                    <p className="font-medium animate-pulse text-sm">Painting your masterpiece...</p>
                  </div>
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={retryCount}
                  src={generatedImageUrl}
                  alt="Generated Art"
                  className={`w-full h-full object-contain rounded-xl transition-opacity duration-700 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                  onLoad={() => {
                    setImageLoading(false);
                    setError("");
                  }}
                  onError={() => {
                    setImageLoading(false);
                    setError("Failed to load image. Click Retry to try again.");
                  }}
                />

                {!imageLoading && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <a
                      href={generatedImageUrl}
                      download="generated-art.png"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-black/60 hover:bg-black border border-white/10 backdrop-blur-md rounded-xl text-white transition-all shadow-xl"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={handleRetry}
                      className="p-2.5 bg-black/60 hover:bg-black border border-white/10 backdrop-blur-md rounded-xl text-white transition-all shadow-xl"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center gap-5 text-zinc-400">
                <Loader2 className="w-12 h-12 text-zinc-600 animate-spin" />
                <p className="font-medium animate-pulse text-sm tracking-wide">Preparing Canvas...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-600">
                <ImageIcon className="w-16 h-16 opacity-30" strokeWidth={1.5} />
                <p className="text-center text-sm font-medium">Your creation will appear here</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-zinc-500 font-medium text-[13px] px-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent (24h)
          </div>
        </div>
      </div>
    </div>
  );
}
