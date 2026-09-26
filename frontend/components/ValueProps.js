import { Compass, ShieldCheck, Clock, Award } from "lucide-react";

const PROPS = [
  {
    icon: Compass,
    title: "WATER RESISTANCE TESTED",
  },
  {
    icon: Clock,
    title: "SHOCK-RESISTANT MOVEMENT",
  },
  {
    icon: Award,
    title: "PROFESSIONAL GRADE",
  },
  {
    icon: ShieldCheck,
    title: "DURABILITY GUARANTEED",
  },
];

export default function ValueProps() {
  return (
    <section className="bg-neutral-900/60 border-y border-neutral-800/80 py-10 my-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {PROPS.map((prop, idx) => {
          const Icon = prop.icon;
          return (
            <div 
              key={idx} 
              className="group flex flex-col items-center justify-center space-y-3 p-4 rounded-xl hover:bg-neutral-900 transition-all duration-300 border border-transparent hover:border-neutral-700/80 hover:shadow-xl hover:shadow-black/50"
            >
              <div className="p-3 rounded-full bg-black border border-neutral-800 text-neutral-300 group-hover:border-neutral-700 group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-md shadow-black/40">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-neutral-400 group-hover:text-white uppercase max-w-40 leading-tight font-sans transition-colors duration-300">
                {prop.title}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}