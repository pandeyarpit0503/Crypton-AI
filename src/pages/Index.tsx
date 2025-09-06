import { EnhancedHero } from "@/components/dashboard/enhanced-hero";
import { PopularCurrencyAlerts } from "@/components/alerts/PopularCurrencyAlerts";
import CryptoChart from "@/components/ui/crypto-chart";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedHero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-12">
        {/* Smart Market Alerts for Popular Currencies */}
        <div className="animate-fade-in">
          <PopularCurrencyAlerts maxAlerts={6} showHeader={true} />
        </div>

        {/* Bitcoin Chart */}
        <div className="animate-fade-in">
          <CryptoChart coinId="bitcoin" coinName="Bitcoin" />
        </div>
      </div>
    </div>
  );
};

export default Index;
