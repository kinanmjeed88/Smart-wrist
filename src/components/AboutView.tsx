
import React, { useState } from 'react';
import { 
  TikTokIcon, 
  YouTubeIcon, 
  TelegramIcon, 
  FacebookIcon, 
  InstagramIcon 
} from './Icons';
import { APP_LOGO, LOCAL_USER_IMAGE } from '../constants';

export const AboutView: React.FC = () => {
  const [imgSrc, setImgSrc] = useState(LOCAL_USER_IMAGE);

  const socialLinks = [
    { 
      icon: <TikTokIcon className="w-6 h-6" />, 
      label: 'TikTok', 
      url: 'https://www.tiktok.com/@techtouch6',
      color: 'hover:text-pink-500'
    },
    { 
      icon: <YouTubeIcon className="w-6 h-6" />, 
      label: 'YouTube', 
      url: 'https://youtube.com/@kinanmajeed?si=I2yuzJT2rRnEHLVg',
      color: 'hover:text-red-600'
    },
    { 
      icon: <TelegramIcon className="w-6 h-6" />, 
      label: 'Telegram', 
      url: 'https://t.me/addlist/Gxcy1FFJONhkMjFi',
      color: 'hover:text-blue-400'
    },
    { 
      icon: <FacebookIcon className="w-6 h-6" />, 
      label: 'Facebook', 
      url: 'https://www.facebook.com/share/172Cr1ygFt/',
      color: 'hover:text-blue-600'
    },
    { 
      icon: <InstagramIcon className="w-6 h-6" />, 
      label: 'Instagram', 
      url: 'https://www.instagram.com/techtouch0?igsh=MXU4cXNzdjZnNDZqbQ==',
      color: 'hover:text-pink-600'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col items-center animate-in fade-in">
      <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 mb-6 shadow-2xl">
         <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden relative group">
            <img 
                src={imgSrc} 
                onError={() => setImgSrc(APP_LOGO)} // Switch to default logo on error
                alt="Kinan Majeed" 
                className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110" 
            />
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">Kinan Majeed</h2>
      <p className="text-cyan-400 text-sm font-medium mb-6">TechTouch Developer</p>

      <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-2xl p-5 w-full max-w-sm shadow-lg mb-8 text-center">
        <p className="text-gray-300 text-sm leading-relaxed">
          كنان مجيد الصائغ، مهتم بالأخبار والمعلومات التقنية والذكاء الاصطناعي، ونشر التطبيقات المعدلة الرياضية والأفلام والتطبيقات الخدمية.
        </p>
      </div>

      <div className="w-full max-w-sm">
         <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4 text-center border-b border-gray-800 pb-2">
            تابعنا على المنصات الرسمية
         </h3>
         <div className="grid grid-cols-5 gap-3">
            {socialLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-2 group transition-transform hover:-translate-y-1`}
                >
                    <div className={`bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl border border-gray-700 shadow-md text-gray-400 transition-colors ${link.color} group-hover:border-gray-600`}>
                        {link.icon}
                    </div>
                </a>
            ))}
         </div>
      </div>
      
      <div className="mt-auto py-8 text-center">
         <p className="text-[10px] text-gray-600">V 2.5 - All Rights Reserved © 2024</p>
      </div>
    </div>
  );
};
