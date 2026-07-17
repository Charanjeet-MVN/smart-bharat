import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Shield, Award, Medal, CheckCircle2 } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: "trophy" | "star" | "shield" | "award" | "medal";
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
}

const getIcon = (type: string, isUnlocked: boolean) => {
  const props = {
    className: `w-8 h-8 ${isUnlocked ? 'text-white' : 'text-slate-400'}`
  };
  
  switch(type) {
    case "trophy": return <Trophy {...props} />;
    case "star": return <Star {...props} />;
    case "shield": return <Shield {...props} />;
    case "award": return <Award {...props} />;
    case "medal": return <Medal {...props} />;
    default: return <Award {...props} />;
  }
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  const percentage = Math.min(100, Math.max(0, (achievement.progress / achievement.maxProgress) * 100));

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${achievement.isUnlocked ? 'border-amber-200 shadow-amber-100/50 hover:shadow-amber-200/50' : 'border-slate-200 opacity-75 grayscale-[0.5]'}`}>
      {achievement.isUnlocked && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-bl-full" />
      )}
      <CardContent className="p-5 flex gap-4">
        <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center shadow-inner ${
          achievement.isUnlocked 
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-600/20' 
            : 'bg-slate-100 border-2 border-slate-200'
        }`}>
          {getIcon(achievement.iconType, achievement.isUnlocked)}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{achievement.title}</h4>
            {achievement.isUnlocked && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-slate-500 mb-3 line-clamp-2">{achievement.description}</p>
          
          {!achievement.isUnlocked ? (
            <div className="space-y-1.5 mt-auto">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Progress</span>
                <span>{achievement.progress} / {achievement.maxProgress}</span>
              </div>
              <Progress value={percentage} className="h-1.5" />
            </div>
          ) : (
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-auto bg-amber-50 inline-block px-2 py-0.5 rounded-full w-fit">
              Unlocked
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
