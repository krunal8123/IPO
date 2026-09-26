import React, { useMemo } from 'react';
import { IpoItem } from '../../types/ipo';
import { AllotmentOddsCalculator } from './AllotmentOddsCalculator';
import { Target, Sparkles } from 'lucide-react';

interface AnalyticsViewProps {
  ipos: IpoItem[];
  onSelectIpo: (ipo: IpoItem) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ ipos, onSelectIpo }) => {
  return (
    <div className="space-y-6 pb-8">
      <AllotmentOddsCalculator ipos={ipos} />
    </div>
  );
};
