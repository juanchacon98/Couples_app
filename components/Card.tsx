import React, { useRef, useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Activity } from '../types';

interface CardProps {
  activity: Activity;
  onSwipe: (direction: 'like' | 'dislike') => void;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({ activity, onSwipe, disabled }) => {
  const controls = useAnimation();
  const [exitX, setExitX] = useState<number | null>(null);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(500);
      onSwipe('like');
    } else if (info.offset.x < -threshold) {
      setExitX(-500);
      onSwipe('dislike');
    } else {
      controls.start({ x: 0, rotate: 0 });
    }
  };

  return (
    <motion.div
      drag={disabled ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== null ? { x: exitX, opacity: 0 } : controls}
      whileDrag={{ rotate: 0 }}
      className="absolute w-full max-w-sm h-[600px] bg-white rounded-3xl shadow-xl overflow-hidden touch-none border border-gray-100"
      style={{ top: 0 }}
    >
      <div className="relative h-2/3 bg-gray-200">
        {activity.imageUrl ? (
            <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-300">
                <span className="text-6xl">✨</span>
            </div>
        )}
        
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
          {activity.difficulty}
        </div>
      </div>
      
      <div className="p-6 h-1/3 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{activity.title}</h2>
          <p className="text-gray-500 text-sm line-clamp-2">{activity.description}</p>
        </div>

        <div className="flex gap-2 mt-4">
          {activity.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Overlay indicators */}
      <motion.div 
        className="absolute top-8 left-8 border-4 border-green-500 text-green-500 text-3xl font-bold px-4 py-2 rounded-lg transform -rotate-12 opacity-0"
        style={{ opacity: 0 }} // In a real app, map this to x-drag
      >
        YES
      </motion.div>
    </motion.div>
  );
};

export default Card;