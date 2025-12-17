import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';
import { mockFeedService } from '../services/mockBackend';
import { Activity, FeedState } from '../types';
import Card from '../components/Card';
import { CATEGORIES } from '../constants';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

const FeedPage: React.FC = () => {
  const params = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user, couple } = useAuthStore();
  
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [feedState, setFeedState] = useState<FeedState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swiping, setSwiping] = useState(false);

  // Determine Category Display
  const categoryId = params.category;
  const categoryInfo = CATEGORIES.find(c => c.id === categoryId);

  const fetchCurrent = useCallback(async () => {
    if (!user || !categoryId) return;
    setLoading(true);
    setError(null);
    try {
      // Pass user.id as well for preview mode support (when couple is null)
      const response = await mockFeedService.getCurrentActivity(couple?.id, user.id, categoryId);
      setCurrentActivity(response.activity);
      setFeedState(response.feedState);
    } catch (err: any) {
      console.error(err);
      setError("Failed to sync feed.");
    } finally {
      setLoading(false);
    }
  }, [couple, user, categoryId]);

  useEffect(() => {
    fetchCurrent();
  }, [fetchCurrent]);

  const handleSwipe = async (direction: 'like' | 'dislike') => {
    if (!user || !currentActivity || !categoryId || !feedState || swiping) return;

    setSwiping(true);
    try {
      // Pass user.id for preview mode
      const response = await mockFeedService.swipe(
        couple?.id, 
        user.id, 
        categoryId, 
        currentActivity.id, 
        direction, 
        feedState.current_index
      );

      // Success: replace card
      setCurrentActivity(response.activity);
      setFeedState(response.feedState);

    } catch (err) {
      console.error("Swipe failed", err);
      alert("Sync error! Someone else might have swiped. Refreshing...");
      fetchCurrent();
    } finally {
      setSwiping(false);
    }
  };

  if (!categoryInfo) return <div className="p-8 text-center">Invalid Category</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center overflow-hidden">
      {/* Header */}
      <div className="w-full p-4 flex items-center justify-between bg-white shadow-sm z-10">
        <button onClick={() => navigate('/categories')} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold flex items-center gap-2">
          <span>{categoryInfo.icon}</span> {categoryInfo.label}
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Warning for Preview Mode */}
      {!couple && (
        <div className="w-full bg-slate-800 text-white text-xs py-2 text-center px-4 font-medium z-10">
          ⚠️ Preview Mode: You won't see matches until you link with your partner.
        </div>
      )}

      {/* Feed Area */}
      <div className="flex-1 w-full max-w-md relative flex items-center justify-center p-4">
        {loading && !currentActivity && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-64 h-96 bg-gray-200 rounded-2xl mb-4"></div>
            <p className="text-gray-400 font-medium">Loading cards...</p>
          </div>
        )}

        {!loading && !currentActivity && feedState?.is_finished && (
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-xs">
            <div className="text-4xl mb-4">🏁</div>
            <h3 className="text-xl font-bold mb-2">That's all!</h3>
            <p className="text-gray-500 mb-6">You've gone through all activities in this category.</p>
            <button 
              onClick={() => {
                if (categoryId) {
                  // Reset debug helper (requires updating mock logic to handle no coupleId)
                  mockFeedService.resetFeed(couple?.id || `preview_${user?.id}`, categoryId).then(() => fetchCurrent());
                }
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Reset (Debug)
            </button>
          </div>
        )}
        
        {error && (
            <div className="text-center text-red-500 bg-white p-6 rounded-xl shadow">
                <AlertCircle className="w-8 h-8 mx-auto mb-2"/>
                {error}
                <button onClick={fetchCurrent} className="block mt-4 text-blue-500 underline mx-auto">Retry</button>
            </div>
        )}

        {!loading && currentActivity && (
          <div className="relative w-full h-[600px] flex justify-center">
             {/* Background Card Effect */}
            <div className="absolute top-2 w-[90%] h-full bg-white/50 rounded-3xl scale-95 -z-10" />
            
            <Card 
              activity={currentActivity} 
              onSwipe={handleSwipe} 
              disabled={swiping}
            />
          </div>
        )}
      </div>

      {/* Controls (Visual only, interactions on card) */}
      <div className="w-full max-w-sm pb-8 px-8 flex justify-between items-center z-10">
         <button 
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:scale-110 transition"
            onClick={() => handleSwipe('dislike')}
            disabled={swiping || !currentActivity}
         >
            <span className="text-2xl">✕</span>
         </button>
         
         <button 
            className="p-3 bg-gray-200 rounded-full text-gray-500 hover:bg-gray-300"
            onClick={fetchCurrent}
            disabled={swiping}
         >
             <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
         </button>

         <button 
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-green-500 hover:scale-110 transition"
            onClick={() => handleSwipe('like')}
            disabled={swiping || !currentActivity}
         >
            <span className="text-2xl">♥</span>
         </button>
      </div>
    </div>
  );
};

export default FeedPage;