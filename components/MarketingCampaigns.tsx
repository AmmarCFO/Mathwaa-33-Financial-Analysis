import React from 'react';
import type { MarketingVideo } from '../types';
import { PlayIcon } from './Icons';
import { motion } from 'framer-motion';
import { StaggeredGrid, AnimatedItem } from './AnimatedWrappers';

interface MarketingCampaignsProps {
  socialVideos: MarketingVideo[];
}

const VideoCard: React.FC<{ video: MarketingVideo }> = ({ video }) => {
  return (
    <motion.div 
      className="bg-white/50 rounded-xl overflow-hidden group transition-shadow duration-300 hover:shadow-2xl"
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          <motion.img 
            src={video.thumbnailUrl} 
            alt={video.title} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A2C5A]/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <PlayIcon />
          </div>
        </div>
        <div className="p-5">
          <h4 className="font-semibold text-[#4A2C5A] truncate">{video.title}</h4>
          <p 
            className="text-sm text-[#2A5B64] group-hover:text-[#1e4248] mt-2 inline-block font-bold transition-colors"
          >
            Watch Video &rarr;
          </p>
        </div>
      </a>
    </motion.div>
  );
};

const MarketingCampaigns: React.FC<MarketingCampaignsProps> = ({ socialVideos }) => {
  return (
    <div className="space-y-20 sm:space-y-24">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#4A2C5A] my-8 sm:my-12 text-center">Social Media Marketing</h3>
        <StaggeredGrid>
          {socialVideos.map(video => 
            <AnimatedItem key={video.id}>
              <VideoCard video={video} />
            </AnimatedItem>
          )}
        </StaggeredGrid>
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#4A2C5A] mb-6 sm:mb-8 text-center">Property Listing Platforms</h3>
        <div className="bg-white/50 p-8 rounded-xl text-center shadow-lg">
            <p className="text-base sm:text-lg text-[#4A2C5A]/80">
                To ensure maximum reach, our properties are actively listed on leading real estate platforms, including <span className="font-semibold text-[#2A5B64]">Bayut</span> and <span className="font-semibold text-[#2A5B64]">Aqaar</span>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default MarketingCampaigns;
