import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Percent, 
  BarChart3, 
  Wallet, 
  Plus,
  Search,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { AlertType, AlertPriority, CreateAlertRequest, AlertTemplate } from '@/types/alerts';

interface CreateAlertFormProps {
  onSubmit: (alertData: CreateAlertRequest) => Promise<void>;
  onCancel: () => void;
  templates: AlertTemplate[];
}

export const CreateAlertForm = ({ onSubmit, onCancel, templates }: CreateAlertFormProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<AlertTemplate | null>(null);
  const [alertType, setAlertType] = useState<AlertType>('price_threshold');
  const [formData, setFormData] = useState<Partial<CreateAlertRequest>>({
    name: '',
    description: '',
    type: 'price_threshold',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Popular coins for quick selection
  const popularCoins = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
    { id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' }
  ];

  const handleTemplateSelect = (template: AlertTemplate) => {
    setSelectedTemplate(template);
    setAlertType(template.type);
    setFormData({
      ...template.template,
      name: template.name,
      description: template.description
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData as CreateAlertRequest);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'price_threshold':
        return <DollarSign className="w-5 h-5" />;
      case 'percentage_change':
        return <Percent className="w-5 h-5" />;
      case 'trend_signal':
        return <BarChart3 className="w-5 h-5" />;
      case 'portfolio_change':
        return <Wallet className="w-5 h-5" />;
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Alert Templates */}
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-crypto-green" />
            <span>Quick Setup Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-crypto-green/50 ${
                  selectedTemplate?.id === template.id
                    ? 'border-crypto-green bg-crypto-green/10'
                    : 'border-border bg-card/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {template.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Form */}
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-crypto-blue" />
            <span>Create Smart Alert</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Alert Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Bitcoin Price Alert"
                  value={formData.name || ''}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe when this alert should trigger..."
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={2}
              />
            </div>

            {/* Alert Type Selection */}
            <div className="space-y-3">
              <Label>Alert Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['price_threshold', 'percentage_change', 'trend_signal', 'portfolio_change'] as AlertType[]).map((type) => (
                  <div
                    key={type}
                    onClick={() => {
                      setAlertType(type);
                      updateFormData('type', type);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      alertType === type
                        ? 'border-crypto-blue bg-crypto-blue/10'
                        : 'border-border bg-card/50 hover:border-crypto-blue/50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`p-2 rounded-lg ${alertType === type ? 'bg-crypto-blue/20 text-crypto-blue' : 'bg-gray-500/20 text-gray-400'}`}>
                        {getAlertTypeIcon(type)}
                      </div>
                      <span className="text-xs font-medium text-center">
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Type-specific fields */}
            {alertType === 'price_threshold' && (
              <div className="space-y-4 p-4 bg-card/30 rounded-lg">
                <h3 className="font-semibold flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Price Threshold Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cryptocurrency</Label>
                    <Select value={formData.coinId} onValueChange={(value) => {
                      const coin = popularCoins.find(c => c.id === value);
                      if (coin) {
                        updateFormData('coinId', coin.id);
                        updateFormData('coinSymbol', coin.symbol);
                        updateFormData('coinName', coin.name);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent>
                        {popularCoins.map((coin) => (
                          <SelectItem key={coin.id} value={coin.id}>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{coin.symbol}</span>
                              <span className="text-gray-400">{coin.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={formData.condition} onValueChange={(value) => updateFormData('condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="crosses_above">Crosses Above</SelectItem>
                        <SelectItem value="crosses_below">Crosses Below</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetPrice">Target Price (USD)</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 70000"
                    value={formData.targetPrice || ''}
                    onChange={(e) => updateFormData('targetPrice', parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name}
                className="bg-crypto-green hover:bg-crypto-green/80"
              >
                {isSubmitting ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
