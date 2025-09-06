import { AlertNotification } from '@/types/alerts';

class NotificationService {
  private hasPermission = false;

  constructor() {
    this.requestPermission();
  }

  // Request browser notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Send browser notification
  async sendBrowserNotification(
    title: string,
    message: string,
    options?: {
      icon?: string;
      tag?: string;
      actionUrl?: string;
      data?: any;
    }
  ): Promise<void> {
    if (!this.hasPermission) {
      console.warn('No notification permission');
      return;
    }

    try {
      const notification = new Notification(title, {
        body: message,
        icon: options?.icon || '/crypto-icon.png',
        tag: options?.tag || 'smart-alert',
        badge: '/crypto-icon.png',
        requireInteraction: true,
        data: options?.data,
        actions: options?.actionUrl ? [
          {
            action: 'view',
            title: 'View Details',
            icon: '/view-icon.png'
          }
        ] : undefined
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        if (options?.actionUrl) {
          window.location.href = options.actionUrl;
        }
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      console.log('📢 Browser notification sent:', title);
    } catch (error) {
      console.error('Error sending browser notification:', error);
    }
  }

  // Send toast notification (using your existing toast system)
  sendToastNotification(
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000
  ): void {
    // This would integrate with your existing toast system
    // For now, we'll use console logging
    const emoji = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[type];

    console.log(`${emoji} Toast: ${title} - ${message}`);

    // In a real implementation, you'd call your toast system here
    // Example: toast({ title, description: message, variant: type === 'error' ? 'destructive' : 'default' });
  }

  // Format alert message for notifications
  formatAlertMessage(alertType: string, coinSymbol?: string, value?: number, condition?: string): {
    title: string;
    message: string;
    emoji: string;
  } {
    switch (alertType) {
      case 'price_threshold':
        const priceEmoji = condition?.includes('above') ? '🚀' : '⚠️';
        return {
          title: `${coinSymbol} Price Alert`,
          message: `${coinSymbol} ${condition} $${value?.toLocaleString()}`,
          emoji: priceEmoji
        };

      case 'percentage_change':
        const changeEmoji = (value || 0) > 0 ? '📈' : '📉';
        return {
          title: `${coinSymbol} Volatility Alert`,
          message: `${coinSymbol} changed ${value?.toFixed(2)}% - high volatility detected!`,
          emoji: changeEmoji
        };

      case 'trend_signal':
        const trendEmoji = value === 1 ? '📈' : value === -1 ? '📉' : '➡️';
        const trendName = value === 1 ? 'bullish' : value === -1 ? 'bearish' : 'neutral';
        return {
          title: `${coinSymbol} Trend Alert`,
          message: `${coinSymbol} trend turned ${trendName} - signal detected!`,
          emoji: trendEmoji
        };

      case 'portfolio_change':
        const portfolioEmoji = (value || 0) > 0 ? '🎉' : '⚠️';
        const direction = (value || 0) > 0 ? 'up' : 'down';
        return {
          title: 'Portfolio Alert',
          message: `Your portfolio is ${direction} ${Math.abs(value || 0).toFixed(2)}%`,
          emoji: portfolioEmoji
        };

      default:
        return {
          title: 'Smart Alert',
          message: 'Market condition detected',
          emoji: '🔔'
        };
    }
  }

  // Send smart alert notification
  async sendSmartAlert(
    alertType: string,
    alertName: string,
    coinSymbol?: string,
    value?: number,
    condition?: string,
    options?: {
      priority?: 'low' | 'medium' | 'high' | 'critical';
      actionUrl?: string;
      data?: any;
    }
  ): Promise<void> {
    const formatted = this.formatAlertMessage(alertType, coinSymbol, value, condition);
    
    // Determine notification urgency based on priority
    const isUrgent = options?.priority === 'high' || options?.priority === 'critical';
    
    // Send browser notification for urgent alerts or if user prefers them
    if (isUrgent || this.shouldSendBrowserNotification()) {
      await this.sendBrowserNotification(
        `${formatted.emoji} ${formatted.title}`,
        formatted.message,
        {
          icon: '/crypto-icon.png',
          tag: `alert-${alertType}-${coinSymbol}`,
          actionUrl: options?.actionUrl || '/alerts',
          data: options?.data
        }
      );
    }

    // Always send toast notification
    const toastType = options?.priority === 'critical' ? 'error' : 
                     options?.priority === 'high' ? 'warning' : 'info';
    
    this.sendToastNotification(
      formatted.title,
      formatted.message,
      toastType,
      isUrgent ? 8000 : 5000 // Longer duration for urgent alerts
    );
  }

  // Check if browser notifications should be sent
  private shouldSendBrowserNotification(): boolean {
    // Check user preferences (would be stored in localStorage or user settings)
    const userPrefs = localStorage.getItem('notification-preferences');
    if (userPrefs) {
      try {
        const prefs = JSON.parse(userPrefs);
        return prefs.browserNotifications !== false;
      } catch {
        return true; // Default to enabled
      }
    }
    return true; // Default to enabled
  }

  // Update notification preferences
  updateNotificationPreferences(preferences: {
    browserNotifications?: boolean;
    toastNotifications?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  }): void {
    localStorage.setItem('notification-preferences', JSON.stringify(preferences));
    console.log('📱 Notification preferences updated:', preferences);
  }

  // Get current notification preferences
  getNotificationPreferences(): {
    browserNotifications: boolean;
    toastNotifications: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  } {
    const userPrefs = localStorage.getItem('notification-preferences');
    const defaultPrefs = {
      browserNotifications: true,
      toastNotifications: true,
      emailNotifications: false,
      pushNotifications: false
    };

    if (userPrefs) {
      try {
        return { ...defaultPrefs, ...JSON.parse(userPrefs) };
      } catch {
        return defaultPrefs;
      }
    }
    return defaultPrefs;
  }

  // Test notification system
  async testNotifications(): Promise<void> {
    console.log('🧪 Testing notification system...');
    
    // Test browser notification
    await this.sendBrowserNotification(
      '🧪 Test Alert',
      'This is a test notification from Smart Alerts',
      {
        tag: 'test-notification',
        actionUrl: '/alerts'
      }
    );

    // Test toast notification
    this.sendToastNotification(
      'Test Alert',
      'This is a test toast notification',
      'info'
    );

    // Test smart alert
    await this.sendSmartAlert(
      'price_threshold',
      'Test Bitcoin Alert',
      'BTC',
      70000,
      'above',
      {
        priority: 'medium',
        actionUrl: '/alerts'
      }
    );
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Get notification permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

export const notificationService = new NotificationService();
