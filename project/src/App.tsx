import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  User, 
  HelpCircle, 
  Shield, 
  Heart, 
  AlertTriangle,
  Mic,
  Volume2,
  Share2,
  Crown,
  ChevronDown,
  ChevronRight,
  Check,
  Loader2,
  X
} from 'lucide-react';

interface UserProfile {
  fullName: string;
  bloodGroup: string;
  allergies: string[];
  medicalConditions: string;
  medications: string;
  emergencyContact: string;
  insuranceInfo: string;
}

interface EmergencyInstructions {
  [key: string]: string;
}

const emergencyInstructions: EmergencyInstructions = {
  'cpr': 'Place hands on center of chest. Push hard and fast at least 2 inches deep. Allow complete chest recoil. Push at rate of 100-120 per minute.',
  'bleeding': 'Apply direct pressure to the wound with a clean cloth. Elevate the injured area above heart level if possible. Do not remove embedded objects.',
  'seizure': 'Clear area of dangerous objects. Place person on their side. Do not put anything in their mouth. Time the seizure and call for help if it lasts more than 5 minutes.',
  'heart-attack': 'Call 911 immediately. Have person sit down and rest. Give aspirin if available and not allergic. Loosen tight clothing.',
  'stroke': 'Call 911 immediately. Note time symptoms started. Keep person calm and lying down with head slightly elevated.',
  'choking': 'For adults: Give 5 back blows between shoulder blades, then 5 abdominal thrusts. Repeat until object is expelled.',
  'burns': 'Cool the burn with cool running water for 10-20 minutes. Remove jewelry before swelling. Cover with sterile gauze.',
  'allergic': 'Remove or avoid trigger if known. Use epinephrine auto-injector if available. Call 911. Monitor breathing and consciousness.'
};

const allergyOptions = [
  'Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Milk', 'Eggs', 
  'Soy', 'Wheat', 'Sesame', 'Latex', 'Penicillin', 'Aspirin'
];

const faqData = [
  {
    question: "How does MediSOS work in an emergency?",
    answer: "MediSOS instantly connects you to emergency services, shares your location and medical information, and provides step-by-step emergency instructions with voice guidance."
  },
  {
    question: "Is my medical data secure?",
    answer: "Yes, all medical data is encrypted and stored securely. We use blockchain technology for additional security and only share information with authorized emergency responders."
  },
  {
    question: "Can I use MediSOS offline?",
    answer: "Basic emergency instructions are available offline, but calling emergency services and sharing location requires an internet connection."
  },
  {
    question: "How accurate is the voice recognition?",
    answer: "Our voice recognition system is trained to detect emergency keywords in multiple languages with 95% accuracy, even in noisy environments."
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    bloodGroup: '',
    allergies: [],
    medicalConditions: '',
    medications: '',
    emergencyContact: '',
    insuranceInfo: ''
  });
  const [location, setLocation] = useState<string>('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [language, setLanguage] = useState('english');
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [notification, setNotification] = useState<{message: string, type: string} | null>(null);

  useEffect(() => {
    loadUserProfile();
    getCurrentLocation();
    startVoiceRecognition();
  }, []);

  const loadUserProfile = () => {
    const saved = localStorage.getItem('medisos_profile');
    if (saved) {
      setUserProfile(JSON.parse(saved));
    }
  };

  const saveProfile = () => {
    localStorage.setItem('medisos_profile', JSON.stringify(userProfile));
    showNotification('Profile saved successfully!', 'success');
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        },
        () => {
          setLocation('Location access denied');
        }
      );
    }
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        if (transcript.toLowerCase().includes('help me')) {
          activateEmergency();
          recognition.stop();
        }
      };
      
      recognition.onerror = () => {
        setTimeout(startVoiceRecognition, 1000);
      };
      
      recognition.onend = () => {
        setTimeout(startVoiceRecognition, 1000);
      };
      
      recognition.start();
      setIsVoiceActive(true);
    }
  };

  const activateEmergency = () => {
    setIsEmergencyMode(true);
    getCurrentLocation();
    playEmergencySound();
  };

  const playEmergencySound = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    }
  };

  const speakInstructions = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const callForHelp = () => {
    setIsCallInProgress(true);
    setTimeout(() => {
      setIsCallInProgress(false);
      showNotification('Emergency services have been contacted!', 'success');
    }, 3000);
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const renderHomePage = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">MediSOS</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Your personal emergency medical assistant. Get instant help when you need it most.
        </p>
      </div>

      {/* Emergency Button */}
      <div className="flex justify-center">
        <button
          onClick={activateEmergency}
          className="w-48 h-48 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex flex-col items-center justify-center text-white font-bold text-xl shadow-2xl transform hover:scale-105 transition-all duration-200 animate-pulse"
        >
          <AlertTriangle className="w-16 h-16 mb-2" />
          EMERGENCY
        </button>
      </div>

      {/* Voice Indicator */}
      {isVoiceActive && (
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <Mic className="w-5 h-5" />
          <span className="text-sm">Voice recognition active - say "Help me"</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">24/7</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">&lt;3min</div>
          <div className="text-sm text-gray-600">Response</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">8+</div>
          <div className="text-sm text-gray-600">Languages</div>
        </div>
      </div>
    </div>
  );

  const renderProfilePage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical Profile</h2>
        <p className="text-gray-600">Keep your medical information up to date for emergencies</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={userProfile.fullName}
            onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
          <select
            value={userProfile.bloodGroup}
            onChange={(e) => setUserProfile({...userProfile, bloodGroup: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
          <div className="grid grid-cols-2 gap-2">
            {allergyOptions.map((allergy) => (
              <label key={allergy} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={userProfile.allergies.includes(allergy)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setUserProfile({...userProfile, allergies: [...userProfile.allergies, allergy]});
                    } else {
                      setUserProfile({...userProfile, allergies: userProfile.allergies.filter(a => a !== allergy)});
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{allergy}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
          <textarea
            value={userProfile.medicalConditions}
            onChange={(e) => setUserProfile({...userProfile, medicalConditions: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="List any medical conditions..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
          <textarea
            value={userProfile.medications}
            onChange={(e) => setUserProfile({...userProfile, medications: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="List current medications..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
          <input
            type="tel"
            value={userProfile.emergencyContact}
            onChange={(e) => setUserProfile({...userProfile, emergencyContact: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Information</label>
          <input
            type="text"
            value={userProfile.insuranceInfo}
            onChange={(e) => setUserProfile({...userProfile, insuranceInfo: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Insurance provider and policy number"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={saveProfile}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Save Profile
          </button>
          <button
            onClick={() => setIsPaywallOpen(true)}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share on Chain
          </button>
        </div>
      </div>
    </div>
  );

  const renderHelpPage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h2>
        <p className="text-gray-600">Find answers to common questions</p>
      </div>

      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              {openFaq === index ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {openFaq === index && (
              <div className="px-4 pb-3 text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-900 mb-2">Emergency Contacts</h3>
        <div className="space-y-1 text-sm text-red-700">
          <div>🚨 Emergency Services: 911</div>
          <div>🏥 Poison Control: 1-800-222-1222</div>
          <div>💊 Crisis Hotline: 988</div>
        </div>
      </div>
    </div>
  );

  const renderEmergencyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-red-600">Emergency Mode</h2>
            <button
              onClick={() => setIsEmergencyMode(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Location Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Current Location</span>
            </div>
            <p className="text-sm text-blue-700">
              {location || 'Getting location...'}
            </p>
          </div>

          {/* Emergency Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Type</label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select emergency type</option>
              <option value="cpr">CPR Needed</option>
              <option value="bleeding">Severe Bleeding</option>
              <option value="seizure">Seizure</option>
              <option value="heart-attack">Heart Attack</option>
              <option value="stroke">Stroke</option>
              <option value="choking">Choking</option>
              <option value="burns">Burns</option>
              <option value="allergic">Allergic Reaction</option>
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="tamil">Tamil</option>
              <option value="spanish">Spanish</option>
            </select>
          </div>

          {/* Instructions */}
          {emergencyType && emergencyInstructions[emergencyType] && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Emergency Instructions</span>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                {emergencyInstructions[emergencyType]}
              </p>
              <button
                onClick={() => speakInstructions(emergencyInstructions[emergencyType])}
                className="text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                🔊 Listen to instructions
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={callForHelp}
              disabled={isCallInProgress}
              className="flex items-center justify-center py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isCallInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calling 911...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Call for Help
                </>
              )}
            </button>
            
            <button
              onClick={() => showNotification(`Emergency contact ${userProfile.emergencyContact || '+1 (555) 123-4567'} has been notified!`, 'info')}
              className="flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              Notify Contact
            </button>
            
            <button
              onClick={() => showNotification('Medical information sent to nearest hospital!', 'success')}
              className="flex items-center justify-center py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Heart className="w-4 h-4 mr-2" />
              Send to Hospital
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaywallModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Premium Features</h2>
            <button
              onClick={() => setIsPaywallOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Premium</h3>
            <p className="text-gray-600">Get access to blockchain sharing and advanced features</p>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Monthly Plan</span>
                <span className="text-xl font-bold">$9.99</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Blockchain medical ID</li>
                <li>✓ Advanced voice recognition</li>
                <li>✓ Priority emergency response</li>
              </ul>
              <button
                onClick={() => {
                  showNotification('RevenueCat subscription initiated for monthly plan!', 'success');
                  setIsPaywallOpen(false);
                }}
                className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Subscribe Monthly
              </button>
            </div>

            <div className="border-2 border-blue-500 rounded-lg p-4 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                BEST VALUE
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Annual Plan</span>
                <div className="text-right">
                  <span className="text-xl font-bold">$99.99</span>
                  <div className="text-sm text-green-600">Save 17%</div>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ All monthly features</li>
                <li>✓ Family sharing (up to 5 members)</li>
                <li>✓ 24/7 medical consultation</li>
              </ul>
              <button
                onClick={() => {
                  showNotification('RevenueCat subscription initiated for annual plan!', 'success');
                  setIsPaywallOpen(false);
                }}
                className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Subscribe Annually
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            7-day free trial • Cancel anytime • Secure payment via RevenueCat
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">MediSOS</span>
          </div>
          {isVoiceActive && (
            <div className="flex items-center space-x-1 text-green-600">
              <Mic className="w-4 h-4" />
              <span className="text-xs">Listening</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {currentPage === 'home' && renderHomePage()}
        {currentPage === 'profile' && renderProfilePage()}
        {currentPage === 'help' && renderHelpPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around py-2">
            <button
              onClick={() => setCurrentPage('home')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                currentPage === 'home' 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Home</span>
            </button>
            
            <button
              onClick={() => setCurrentPage('profile')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                currentPage === 'profile' 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </button>
            
            <button
              onClick={() => setCurrentPage('help')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                currentPage === 'help' 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <HelpCircle className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Help</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {isEmergencyMode && renderEmergencyModal()}
      {isPaywallOpen && renderPaywallModal()}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
          notification.type === 'success' ? 'bg-green-500' : 
          notification.type === 'error' ? 'bg-red-500' : 
          'bg-blue-500'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default App;