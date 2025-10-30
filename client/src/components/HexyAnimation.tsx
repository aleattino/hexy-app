const C1 = "bg-rose-300";
const C2 = "bg-sky-400";
const C3 = "bg-emerald-400";
const C4 = "bg-amber-300";
const C5 = "bg-indigo-400";
const PALETTE_COLORS = [C1, C2, C3, C4, C5];

export default function HexyAnimation() {
  return (
    <>
      <style>
        {`
          @keyframes hexy-focus-blur {
            0%, 100% {
              filter: blur(14px);
              opacity: 0.7;
              transform: scale(0.95);
            }
            30%, 70% {
              filter: blur(0px);
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes hexy-extract-palette {
            0%, 20% {
              opacity: 0;
              transform: translateY(-20px) scale(0.5);
            }
            50%, 100% {
              opacity: 1;
              transform: translateY(0px) scale(1);
            }
            100% {
              opacity: 1;
            }
          }
          .animate-hexy-focus {
            animation: hexy-focus-blur 5s ease-in-out infinite;
          }
          .animate-hexy-extract {
            animation: hexy-extract-palette 5s ease-in-out infinite;
          }
        `}
      </style>
      
      <div className="flex flex-col items-center justify-center p-4" style={{ minWidth: '160px' }}>
        
        <div className="relative w-28 h-28 animate-hexy-focus">
          
          <div className={`absolute w-16 h-16 ${C1} top-4 left-4 rounded-full opacity-70`}></div>
          <div className={`absolute w-14 h-14 ${C2} top-8 left-0 rounded-full opacity-70`}></div>
          <div className={`absolute w-16 h-16 ${C3} top-6 left-8 rounded-full opacity-70`}></div>
          <div className={`absolute w-10 h-10 ${C4} top-2 right-6 rounded-full opacity-70`}></div>
          <div className={`absolute w-12 h-12 ${C5} bottom-2 left-6 rounded-full opacity-70`}></div>
        </div>

        <div className="flex space-x-3 mt-6">
          {PALETTE_COLORS.map((colorClass, index) => (
            <div
              key={index}
              className={`w-5 h-5 rounded-full shadow-md animate-hexy-extract ${colorClass}`}
              style={{
                animationDelay: `${index * 0.15}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </>
  );
}

