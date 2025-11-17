import React from "react";
import { Sparkles, Briefcase, Hospital, Users, Globe } from "lucide-react";

function LandingHeader() {
  return (
    <header className="flex justify-evenly items-center fixed top-0 left-0 right-0 z-50 py-3">
      <div className="flex items-center gap-3">
        <div className="bg-primaryGradient p-2 rounded-[14px]">
          <Sparkles className="text-white text-2xl" />
        </div>
        <span className="text-xl text-[#0A0A0A] font-normal">ORBIT</span>
      </div>
      <div className="grid grid-flow-col items-center w-1/2 gap-2 bg-white py-1 px-1 rounded-2xl shadow-xl">
        <button className="flex items-center gap-3 justify-center py-4 rounded-[14px] bg-headerActiveGradient">
          <div className="p-[10px] rounded-[10px] bg-violetGradient">
            <Briefcase className="text-white text-xl" />
          </div>
          <span>Bedrijven</span>
        </button>
        <button className="flex items-center gap-3 justify-center py-4">
          <div className="p-[10px] rounded-[10px] bg-blueGradient">
            <Hospital className="text-white text-xl" />
          </div>
          <span>Recruiters & Bureaus</span>
        </button>
        <button className="flex items-center gap-3 justify-center py-4">
          <div className="p-[10px] rounded-[10px] bg-darkBlueGradient">
            <Users className="text-white text-xl" />
          </div>
          <span>ZZP'ers</span>
        </button>
      </div>
      <div className="flex gap-2 px-4 py-2 bg-[#FFFFFFCC] rounded-[8px]">
        <Globe className="text-[#0A0A0A] w-4 h-4" />
        <span className="text-xs text-[#0A0A0A]">Nederlands</span>
      </div>
    </header>
  );
}

export default LandingHeader;
