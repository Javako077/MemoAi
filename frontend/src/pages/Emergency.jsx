import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Phone, Save } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function Emergency({ user }) {
  const [contact, setContact] = useState('');
  const [savedContact, setSavedContact] = useState('');
  const [message, setMessage] = useState('');
  const { speak } = useVoice();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/profile/${user.id || user._id}`);
        if (res.data.emergencyContact) {
          setContact(res.data.emergencyContact);
          setSavedContact(res.data.emergencyContact);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, [user]);

  const saveContact = async () => {
    if (!contact || contact.length < 10) {
      speak("Please enter a valid phone number", "en-US");
      setMessage("❌ Enter valid 10 digit number");
      return;
    }

    try {
      await axios.post(`${API_URL}/profile`, {
        userId: user.id || user._id,
        emergencyContact: contact
      });

      setSavedContact(contact);
      setMessage("✅ Contact saved successfully");
      speak("Emergency number save ho gaya hai", "hi-IN");
    } catch (error) {
      console.error(error);
      setMessage("❌ Saving failed");
      speak("Saving failed, please try again", "en-US");
    }
  };

  const triggerSOS = () => {
    if (!savedContact) {
      speak("Please save emergency contact first", "en-US");
      setMessage("❌ No contact saved");
      return;
    }

    speak("Emergency Alert! Family members ko notify kiya ja raha hai.", "hi-IN");
    window.location.href = `tel:${savedContact}`;
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-8 sm:space-y-10 max-w-3xl mx-auto h-full">

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-red-500">🚨 EMERGENCY</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Press SOS in case of emergency</p>
      </div>

      {/* SOS Button */}
      <button 
        onClick={triggerSOS}
        className="bg-red-500 hover:bg-red-600 text-white h-48 w-48 sm:h-64 sm:w-64 rounded-full flex flex-col items-center justify-center shadow-xl animate-pulse transition-all"
      >
        <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20" />
        <span className="text-xl sm:text-2xl font-bold mt-2">SOS</span>
      </button>

      {/* Contact Card */}
      <div className="w-full bg-white shadow-lg rounded-2xl p-6 space-y-4">

        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Phone /> Emergency Contact
        </h2>

        <div className="flex gap-3">
          <input
            className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400 text-black"
            placeholder="Enter 10 digit number"
            value={contact}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setContact(value);
            }}
            maxLength={10}
          />

          <button 
            onClick={saveContact}
            className="bg-green-500 hover:bg-green-600 text-white px-5 rounded-lg flex items-center"
          >
            <Save />
          </button>
        </div>

        {/* Saved Number Display */}
        {savedContact && (
          <div className="text-green-600 font-medium">
            Saved Number: 📞 {savedContact}
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="text-sm text-gray-600">
            {message}
          </div>
        )}

        <p className="text-sm text-gray-400">
          This number will be called when SOS is pressed.
        </p>
      </div>
    </div>
  );
}