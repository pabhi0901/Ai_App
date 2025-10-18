// Global Speech Manager for text-to-speech functionality
class SpeechManager {
  constructor() {
    this.currentUtterance = null;
    this.currentMessageId = null;
    this.listeners = new Set();
    this.isGloballyMuted = false;
    
    // Auto-stop speech on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopSpeech();
      }
    });
    
    // Auto-stop speech on beforeunload (route change)
    window.addEventListener('beforeunload', () => {
      this.stopSpeech();
    });
    
    // Auto-stop speech on popstate (browser navigation)
    window.addEventListener('popstate', () => {
      this.stopSpeech();
    });
  }
  
  // Register a component to listen for speech state changes
  registerListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  // Notify all listeners of state changes
  notifyListeners(messageId, isPlaying) {
    // Use setTimeout to ensure state updates happen after current execution
    setTimeout(() => {
      this.listeners.forEach(callback => {
        try {
          callback(messageId, isPlaying);
        } catch (error) {
          console.warn('Speech listener error:', error);
        }
      });
    }, 0);
  }
  
  // Start speaking a message
  speak(messageId, text) {
    // Stop any current speech first
    this.stopSpeech();
    
    if (!text || text === '...' || this.isGloballyMuted) return false;
    
    // Create utterance for text-to-speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set female voice
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('hazel') ||
      voice.name.toLowerCase().includes('eva') ||
      voice.gender === 'female'
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Set speech properties
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Set current message BEFORE starting speech
    this.currentMessageId = messageId;
    this.currentUtterance = utterance;
    
    // Handle speech events
    utterance.onstart = () => {
      console.log('Speech started for message:', messageId);
      this.notifyListeners(messageId, true);
    };
    
    utterance.onend = () => {
      console.log('Speech ended for message:', messageId);
      const endedMessageId = this.currentMessageId;
      this.currentUtterance = null;
      this.currentMessageId = null;
      this.notifyListeners(endedMessageId, false);
    };
    
    utterance.onerror = (error) => {
      console.log('Speech error for message:', messageId, error);
      const errorMessageId = this.currentMessageId;
      this.currentUtterance = null;
      this.currentMessageId = null;
      this.notifyListeners(errorMessageId, false);
    };
    
    // Start speaking and immediately notify listeners
    speechSynthesis.speak(utterance);
    this.notifyListeners(messageId, true);
    
    return true;
  }
  
  // Stop current speech
  stopSpeech() {
    const wasPlaying = this.currentMessageId;
    
    if (this.currentUtterance) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
    }
    
    if (this.currentMessageId) {
      const stoppedMessageId = this.currentMessageId;
      this.currentMessageId = null;
      console.log('Speech stopped for message:', stoppedMessageId);
      this.notifyListeners(stoppedMessageId, false);
    }
    
    return wasPlaying;
  }
  
  // Check if a specific message is currently playing
  isPlaying(messageId) {
    return this.currentMessageId === messageId;
  }
  
  // Get currently playing message ID
  getCurrentMessageId() {
    return this.currentMessageId;
  }
  
  // Toggle global mute
  toggleGlobalMute() {
    this.isGloballyMuted = !this.isGloballyMuted;
    if (this.isGloballyMuted) {
      this.stopSpeech();
    }
    return this.isGloballyMuted;
  }
}

// Create and export singleton instance
const speechManager = new SpeechManager();
export default speechManager;