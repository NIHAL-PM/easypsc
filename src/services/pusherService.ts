
// Pusher configuration
const PUSHER_CONFIG = {
  key: 'fbae605a53abe8b81a60',
  cluster: 'ap2'
};

interface PusherMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  examType: string;
}

class PusherService {
  private pusher: any = null;
  private channels: Map<string, any> = new Map();

  constructor() {
    this.initializePusher();
  }

  private async initializePusher() {
    try {
      // Dynamically import Pusher to avoid SSR issues
      const Pusher = (await import('pusher-js')).default;
      
      this.pusher = new Pusher(PUSHER_CONFIG.key, {
        cluster: PUSHER_CONFIG.cluster
      });

      console.log('Pusher initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Pusher:', error);
    }
  }

  subscribeToExamChannel(examType: string, callback: (message: PusherMessage) => void) {
    if (!this.pusher) {
      console.warn('Pusher not initialized');
      return;
    }

    const channelName = `exam-${examType.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = this.pusher.subscribe(channelName);
    channel.bind('new-message', callback);
    
    this.channels.set(channelName, channel);
    console.log(`Subscribed to channel: ${channelName}`);
  }

  sendMessage(examType: string, message: PusherMessage) {
    // In a real implementation, this would send to your backend
    // which would then trigger the Pusher event
    console.log('Message would be sent to backend:', message);
    
    // For demo purposes, we'll simulate receiving the message
    setTimeout(() => {
      const channelName = `exam-${examType.toLowerCase().replace(/\s+/g, '-')}`;
      const channel = this.channels.get(channelName);
      if (channel) {
        // Simulate receiving the message back
        channel.trigger('client-new-message', message);
      }
    }, 100);
  }

  unsubscribeFromChannel(examType: string) {
    const channelName = `exam-${examType.toLowerCase().replace(/\s+/g, '-')}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      this.pusher?.unsubscribe(channelName);
      this.channels.delete(channelName);
      console.log(`Unsubscribed from channel: ${channelName}`);
    }
  }

  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.channels.clear();
      console.log('Pusher disconnected');
    }
  }
}

export const pusherService = new PusherService();
