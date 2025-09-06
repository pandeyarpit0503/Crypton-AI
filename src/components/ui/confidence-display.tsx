import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Target, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Database,
  TrendingUp,
  DollarSign,
  Award,
  Activity
} from 'lucide-react'
import { 
  getConfidenceDescription, 
  getConfidenceColor,
  type ConfidenceFactors 
} from '@/utils/confidenceCalculator'

interface ConfidenceDisplayProps {
  confidence: number
  factors?: ConfidenceFactors
  reasoning?: string[]
  showDetails?: boolean
  className?: string
}

export function ConfidenceDisplay({
  confidence,
  factors,
  reasoning,
  showDetails = false,
  className = ""
}: ConfidenceDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Safety check for confidence value
  const safeConfidence = Math.max(0, Math.min(100, confidence || 0))

  const getFactorIcon = (factorName: string) => {
    switch (factorName) {
      case 'dataQuality': return <Database className="w-4 h-4" />
      case 'marketStability': return <TrendingUp className="w-4 h-4" />
      case 'liquidityScore': return <DollarSign className="w-4 h-4" />
      case 'rankingScore': return <Award className="w-4 h-4" />
      case 'volatilityScore': return <Activity className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getFactorName = (factorKey: string) => {
    switch (factorKey) {
      case 'dataQuality': return 'Data Quality'
      case 'marketStability': return 'Market Stability'
      case 'liquidityScore': return 'Liquidity'
      case 'rankingScore': return 'Market Ranking'
      case 'volatilityScore': return 'Price Stability'
      default: return factorKey
    }
  }

  const getFactorColor = (score: number) => {
    if (score >= 80) return 'text-crypto-green'
    if (score >= 60) return 'text-crypto-blue'
    if (score >= 40) return 'text-crypto-orange'
    return 'text-crypto-red'
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Confidence Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-crypto-blue" />
            <span className="text-sm font-medium">Analysis Confidence</span>
          </div>
          
          {showDetails && factors && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  safeConfidence >= 80 ? 'bg-crypto-green' :
                  safeConfidence >= 60 ? 'bg-crypto-blue' :
                  safeConfidence >= 40 ? 'bg-crypto-orange' : 'bg-crypto-red'
                }`}
                style={{ width: `${safeConfidence}%` }}
              />
            </div>
            <span className={`text-sm font-mono font-bold ${getConfidenceColor(safeConfidence)}`}>
              {safeConfidence}%
            </span>
          </div>
          
          <Badge
            variant="outline"
            className={`${getConfidenceColor(safeConfidence)} border-current`}
          >
            {getConfidenceDescription(safeConfidence)}
          </Badge>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {isExpanded && factors && (
        <Card className="bg-muted/20 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Info className="w-4 h-4" />
              <span>Confidence Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Factor Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(factors).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFactorIcon(key)}
                    <span className="text-sm text-muted-foreground">
                      {getFactorName(key)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-muted rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          value >= 80 ? 'bg-crypto-green' :
                          value >= 60 ? 'bg-crypto-blue' :
                          value >= 40 ? 'bg-crypto-orange' : 'bg-crypto-red'
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono ${getFactorColor(value)}`}>
                      {Math.round(value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reasoning */}
            {reasoning && reasoning.length > 0 && (
              <div className="pt-3 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Key Factors:
                </h4>
                <div className="space-y-1">
                  {reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-crypto-blue rounded-full mt-2 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        {reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Simplified version for inline display
export function ConfidenceBadge({ 
  confidence, 
  showPercentage = true,
  size = 'default'
}: { 
  confidence: number
  showPercentage?: boolean
  size?: 'sm' | 'default' | 'lg'
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <Badge 
      variant="outline" 
      className={`${getConfidenceColor(confidence)} border-current ${sizeClasses[size]}`}
    >
      {showPercentage ? `${confidence}%` : getConfidenceDescription(confidence)}
    </Badge>
  )
}
